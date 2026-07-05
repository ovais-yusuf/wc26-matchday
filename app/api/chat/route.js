import OpenAI from 'openai';
import { getScoreboard } from '../../../lib/apiFootball';
import { T, KO, R16 } from '../../../lib/staticData';

export const maxDuration = 30;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);
}

function normToDisplay(norm) {
  for (const team of Object.values(T)) {
    if (team.n.toLowerCase().replace(/[^a-z0-9]/g, '') === norm) return team.n;
  }
  return norm.charAt(0).toUpperCase() + norm.slice(1);
}

async function buildContext(leaders = {}) {
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const koDates = ['20260629','20260630','20260701','20260702','20260703','20260704','20260705','20260706','20260707'];
  const past = koDates.filter(d => d <= todayStr);
  const scoreArrays = await Promise.allSettled(past.map(d => withTimeout(getScoreboard(d), 5000)));
  const allScores = scoreArrays.flatMap(r => r.status === 'fulfilled' ? r.value : []);

  const resultLines = allScores
    .filter(s => s.status === 'final')
    .map(s => `  ${normToDisplay(s.homeName)} ${s.homeScore}–${s.awayScore} ${normToDisplay(s.awayName)} (${s.statusLabel})`)
    .join('\n') || '  No results yet';

  const scorerLines = (leaders.scorers || []).slice(0, 8)
    .map((p, i) => `  ${i + 1}. ${p.name} (${p.teamName}) — ${p.goals}G${p.assists ? `, ${p.assists}A` : ''}`)
    .join('\n') || '  No data yet';

  const assistLines = (leaders.assisters || []).slice(0, 5)
    .map((p, i) => `  ${i + 1}. ${p.name} (${p.teamName}) — ${p.assists} assists`)
    .join('\n') || '  No data yet';

  const r16Lines = R16.map(m => {
    const h = T[m.h], a = T[m.a];
    return `  ${h?.n || m.h} vs ${a?.n || m.a} | ${m.ds} ${m.t} ${m.z} | ${m.v}, ${m.c}`;
  }).join('\n');

  const teamLines = Object.values(T)
    .map(t => `  ${t.f} ${t.n}: ${t.odds} odds | Best WC finish: ${t.best}`)
    .join('\n');

  return `You are WC26 Analyst — the AI football analyst built into the WC26 Matchday Intelligence app by Ovais Yusuf.
Today: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
Tournament: 2026 FIFA World Cup hosted by USA, Canada, and Mexico.
Phase: Knockouts — group stage complete, Round of 32 complete, Round of 16 in progress.

== TOP SCORERS ==
${scorerLines}

== TOP ASSISTS ==
${assistLines}

== KNOCKOUT RESULTS (R32 + R16 so far) ==
${resultLines}

== ROUND OF 16 FIXTURES ==
${r16Lines}

== ALL 32 TEAMS ==
${teamLines}

Rules: Answer in 2–4 sentences unless a detailed breakdown is explicitly needed. Be specific with names and numbers from the context. If a stat or score isn't in the context, say so — never invent figures. You can draw on general football knowledge for tactical analysis and player reputations.`;
}

export async function POST(request) {
  const body = await request.json();
  const messages = body?.messages;
  if (!Array.isArray(messages) || !messages.length) {
    return Response.json({ error: 'messages required' }, { status: 400 });
  }

  let system;
  try { system = await buildContext(body.leaders || {}); }
  catch { system = 'You are WC26 Analyst, the AI assistant for the 2026 FIFA World Cup app. Answer questions about the tournament.'; }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const s = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          max_tokens: 450,
          stream: true,
          messages: [
            { role: 'system', content: system },
            ...messages,
          ],
        });
        for await (const chunk of s) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        controller.enqueue(encoder.encode('\n\nSorry, something went wrong. Please try again.'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache, no-store' },
  });
}
