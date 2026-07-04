import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  const { home, away, result } = await request.json();
  if (!home || !away || !result) {
    return Response.json({ error: 'home, away, result required' }, { status: 400 });
  }

  const hs = result.homeScore ?? 0;
  const as = result.awayScore ?? 0;
  const label = result.statusLabel || 'FT';
  const winner = hs > as ? home : as > hs ? away : null;

  // Goal events
  const goals = (result.events || []).filter(e => e.type === 'goal' || e.type === 'penalty');
  const ownGoals = (result.events || []).filter(e => e.type === 'own-goal');
  const cards = (result.events || []).filter(e => e.type === 'yellow-card' || e.type === 'red-card');

  function formatEvent(e) {
    const scorerName = e.athletes?.[0]?.displayName || e.athletes?.[0]?.shortName || 'unknown';
    const teamName = e.teamId === result.homeId ? home : away;
    const suffix = e.type === 'penalty' ? ' (pen)' : e.type === 'own-goal' ? ' (og)' : '';
    return `${e.minute || '?'}' — ${scorerName} (${teamName})${suffix}`;
  }

  const goalLines = goals.map(formatEvent).join('\n') || 'No goals in normal events';
  const ownGoalLines = ownGoals.length ? '\nOwn goals:\n' + ownGoals.map(formatEvent).join('\n') : '';
  const cardLines = cards.length ? '\nCards:\n' + cards.map(e => {
    const name = e.athletes?.[0]?.displayName || 'unknown';
    const team = e.teamId === result.homeId ? home : away;
    return `${e.minute || '?'}' — ${name} (${team}) · ${e.type === 'yellow-card' ? 'Yellow' : 'Red'}`;
  }).join('\n') : '';

  // Top team stats (possession, shots, passes)
  const KEY_STATS = ['possessionPct', 'totalShots', 'shotsOnTarget', 'totalPasses', 'foulsCommitted', 'offsides'];
  const statLines = (result.teamStats || []).map(ts => {
    const filtered = (ts.stats || []).filter(s => KEY_STATS.includes(s.key));
    if (!filtered.length) return null;
    const teamName = ts.teamId === result.homeId ? home : away;
    return `${teamName}: ${filtered.map(s => `${s.label} ${s.value}`).join(' | ')}`;
  }).filter(Boolean).join('\n');

  // MOTM
  const motmLine = result.motm
    ? `Man of the Match: ${result.motm.displayName || result.motm.shortName} (${result.motm.teamId === result.homeId ? home : away})`
    : '';

  const prompt = `Write a punchy, compelling match report for:

${home} ${hs}–${as} ${away} (${label})
${winner ? `Winner: ${winner}` : 'Result: Draw'}
${motmLine}

Goals:
${goalLines}${ownGoalLines}${cardLines}

Team stats:
${statLines || 'Not available'}

Write 3–4 short paragraphs in the style of a quality football journalist — atmospheric, specific, never generic. Use actual player names from the events. Lead with the most dramatic moment. End with what this result means for the tournament. Do not use headers or bullet points. Keep it under 250 words.`;

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });
    const report = msg.content[0]?.text || '';
    return Response.json({ report }, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    });
  } catch (err) {
    return Response.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
