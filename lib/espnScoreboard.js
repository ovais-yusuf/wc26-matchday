// Shared ESPN scoreboard parser. Used by the server API and by the browser
// fallback (ESPN allows CORS *). Vercel datacenter IPs are often blocked by
// ESPN, so the client can fetch this URL directly when /api/scores is empty.

export const ESPN_SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';

const ALIAS = { korearepublic: 'southkorea', drcongo: 'congodr' };
const REVERSE_ALIAS = Object.fromEntries(Object.entries(ALIAS).map(([k, v]) => [v, k]));
const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
const normForStatic = (s) => {
  const n = norm(s);
  return REVERSE_ALIAS[n] || n;
};

export function espnScoreboardUrl(date) {
  return `${ESPN_SCOREBOARD}?dates=${date}`;
}

export function parseEspnScoreboard(d) {
  const results = [];
  for (const e of d?.events || []) {
    const comp = e.competitions?.[0];
    if (!comp) continue;
    const st = comp.status?.type;
    const sn = st?.name || '';
    const isPen = sn === 'STATUS_FULL_PEN' || sn === 'STATUS_FINAL_PEN';
    const isAET = sn === 'STATUS_FINAL_AET';
    const isFinal = sn === 'STATUS_FINAL' || sn === 'STATUS_FULL_TIME' || isPen || isAET;
    const isHT = sn === 'STATUS_HALFTIME';
    const isLive = sn === 'STATUS_IN_PROGRESS' || sn === 'STATUS_FIRST_HALF' || sn === 'STATUS_SECOND_HALF' ||
                   sn === 'STATUS_EXTRA_TIME' || sn === 'STATUS_PENALTIES' || isHT;
    if (!isFinal && !isLive) continue;
    const hc = comp.competitors?.find(c => c.homeAway === 'home') || comp.competitors?.[0];
    const ac = comp.competitors?.find(c => c.homeAway === 'away') || comp.competitors?.[1];
    results.push({
      eventId: e.id,
      homeName: normForStatic(hc?.team?.displayName || hc?.team?.name || ''),
      awayName: normForStatic(ac?.team?.displayName || ac?.team?.name || ''),
      homeScore: hc?.score != null ? String(hc.score) : null,
      awayScore: ac?.score != null ? String(ac.score) : null,
      status: isFinal ? 'final' : 'live',
      statusLabel: isFinal ? (isPen ? 'FT (Pens)' : isAET ? 'AET' : 'FT') : isHT ? 'HT' : (comp.status?.displayClock || 'Live'),
    });
  }
  return results;
}

export async function fetchEspnScores(date) {
  if (!date) return [];
  const res = await fetch(espnScoreboardUrl(date), { cache: 'no-store' });
  if (!res.ok) return [];
  return parseEspnScoreboard(await res.json());
}

// Prefer the app API (works locally). If Vercel got an empty ESPN response,
// pull the same scoreboard from the browser, whose residential IP is allowed.
export async function loadScores(date) {
  try {
    const r = await fetch(`/api/scores?date=${date}`, { cache: 'no-store' });
    const d = await r.json();
    if (Array.isArray(d.scores) && d.scores.length) return d.scores;
  } catch { /* fall through to ESPN */ }
  try {
    return await fetchEspnScores(date);
  } catch {
    return [];
  }
}
