import { getMatchResult } from '../../../lib/apiFootball';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const p = new URL(request.url).searchParams;
  const home = p.get('home'), away = p.get('away'), date = p.get('date');
  if (!home || !away) return Response.json({ error: 'home and away required' }, { status: 400 });
  try {
    const data = await getMatchResult(home, away, date);
    const maxAge = data.status === 'final' ? 86400 : data.status === 'live' ? 60 : 0;
    return Response.json(
      { ...data, updated: new Date().toISOString() },
      {
        headers: {
          'Cache-Control': maxAge === 0
            ? 'no-store'
            : `s-maxage=${maxAge}, stale-while-revalidate=86400`,
        },
      }
    );
  } catch (e) {
    return Response.json({ error: String(e.message || e), status: 'error' }, {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
