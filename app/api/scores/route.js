import { getScoreboard } from '../../../lib/apiFootball';

// Always run at request time. Empty ESPN responses must not be cached as
// "all matches final" — [].every() is true in JavaScript.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const p = new URL(request.url).searchParams;
  const date = p.get('date');
  if (!date) return Response.json({ error: 'date required' }, { status: 400 });
  try {
    const scores = await getScoreboard(date);
    const empty = !scores.length;
    const allFinal = !empty && scores.every(s => s.status === 'final');
    const maxAge = empty ? 0 : allFinal ? 3600 : 60;
    return Response.json(
      { scores, updated: new Date().toISOString() },
      {
        headers: {
          'Cache-Control': maxAge === 0
            ? 'no-store'
            : `s-maxage=${maxAge}, stale-while-revalidate=300`,
        },
      },
    );
  } catch (e) {
    return Response.json({ error: String(e.message || e), scores: [] }, {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
