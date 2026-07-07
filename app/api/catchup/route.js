import OpenAI from 'openai';

export const maxDuration = 30;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  const { leaders } = await request.json().catch(() => ({}));

  const scorers = (leaders?.scorers || []).slice(0, 5)
    .map((p, i) => `${i + 1}. ${p.name} (${p.teamName}) — ${p.goals} goals`)
    .join('\n') || 'Data unavailable';

  const prompt = `You are explaining the 2026 FIFA World Cup to someone who has never watched football in their life. Today is July 6, 2026.

Here is the current state of the tournament:
- 48 teams started. Now only 8 remain (the quarterfinals).
- The tournament is hosted across USA, Canada, and Mexico.
- Top scorers so far:
${scorers}

Write a 5–6 sentence plain-English summary that answers: what is the World Cup, what has happened so far, who are the stars, and why should someone care about the next few weeks?

Rules:
- Assume zero football knowledge. Explain any jargon in brackets if you must use it.
- Use real player names and real numbers from the context.
- Make it feel exciting — this is the biggest sports event on the planet.
- Do not use bullet points or headers. Write it as one flowing paragraph.
- End with who the favourites are to win the whole thing.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const s = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          max_tokens: 300,
          stream: true,
          messages: [{ role: 'user', content: prompt }],
        });
        for await (const chunk of s) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch {
        controller.enqueue(encoder.encode('Sorry, could not generate the summary. Please try again.'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache, no-store' },
  });
}
