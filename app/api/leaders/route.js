import { getLeaders } from '../../../lib/apiFootball';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getLeaders();
    return Response.json(
      { ...data, updated: new Date().toISOString() },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (e) {
    return Response.json({ error: String(e.message || e), scorers: [], assisters: [] }, { status: 502 });
  }
}
