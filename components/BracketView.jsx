'use client';
import { useState, useEffect, useMemo } from 'react';
import { R32, R16, QF, SF, FINAL, BRACKET_ORDER } from '../lib/bracketData';
import { loadScores } from '../lib/espnScoreboard';

/* ── helpers ── */
const MONTHS = { January:'01',February:'02',March:'03',April:'04',May:'05',June:'06',July:'07',August:'08',September:'09',October:'10',November:'11',December:'12' };
function fixtureDate(ds) {
  const m = /([A-Za-z]+)\s+(\d+)\s*$/.exec(ds||'');
  const mo = m && MONTHS[m[1]];
  return mo ? `2026${mo}${m[2].padStart(2,'0')}` : '';
}
const norm = s => (s||'').toLowerCase().normalize('NFD').replace(/[^a-z]/g,'');
const ALL_DATES = [...new Set([...R32,...R16,...QF,...SF,...FINAL].map(g=>fixtureDate(g.ds)).filter(Boolean))];

function resolveWinner(game, map, T) {
  if (!game) return null;
  if (game.w) return game.w;               // explicit winner (locked results / penalties)
  const hN = game.h ? norm(T[game.h]?.n||game.h) : null;
  const aN = game.a ? norm(T[game.a]?.n||game.a) : null;
  if (!hN||!aN) return null;
  const sc = map[`${hN}-${aN}`]||map[`${aN}-${hN}`];
  if (!sc||sc.status!=='final') return null;
  const sw = !map[`${hN}-${aN}`];
  const hs = parseInt(sw?sc.awayScore:sc.homeScore,10);
  const as_ = parseInt(sw?sc.homeScore:sc.awayScore,10);
  return hs>as_?game.h:as_>hs?game.a:null;
}

function getScore(game, map, T) {
  if (!game?.h||!game?.a) return null;
  const hN = norm(T[game.h]?.n||game.h);
  const aN = norm(T[game.a]?.n||game.a);
  const sc = map[`${hN}-${aN}`]||map[`${aN}-${hN}`];
  if (!sc) return null;
  const sw = !map[`${hN}-${aN}`];
  return { status:sc.status, statusLabel:sc.statusLabel, hs:sw?sc.awayScore:sc.homeScore, as_:sw?sc.homeScore:sc.awayScore };
}

function buildState(map, T) {
  const G = {};
  for (const g of R32) G[g.id]={...g};
  for (const round of [R16,QF,SF,FINAL]) {
    for (const g of round) {
      const r={...g};
      if (!g.h){const s=G[g.srcH];if(s) r.h=resolveWinner(s,map,T);}
      if (!g.a){const s=G[g.srcA];if(s) r.a=resolveWinner(s,map,T);}
      G[g.id]=r;
    }
  }
  return G;
}

/* ── compact flag card ── */
function Card({ game, T, map, big }) {
  if (!game) return <div className={`bkc-empty${big?' bkc-empty-big':''}`} />;
  const h = game.h?(T[game.h]||{n:game.h,f:'?'}):null;
  const a = game.a?(T[game.a]||{n:game.a,f:'?'}):null;
  const sc = h&&a?getScore(game,map,T):null;
  const scoreFinal = sc?.status==='final';
  const live = sc?.status==='live' && !game.w;
  const done = !!game.w || scoreFinal;
  const hs = parseInt(sc?.hs,10);
  const as_ = parseInt(sc?.as_,10);
  const showNums = scoreFinal && !isNaN(hs) && !isNaN(as_);
  const hw = game.w ? game.w===game.h : (scoreFinal && hs>as_);
  const aw = game.w ? game.w===game.a : (scoreFinal && as_>hs);
  const sep = game.pen ? 'PEN' : done ? 'FT' : live ? <span className="bkc-live-dot"/> : 'vs';

  return (
    <div className={`bkc${done?' bkc-done':live?' bkc-live':''}${big?' bkc-big':''}`}>
      <div className={`bkc-row${hw?' bkc-w':done?' bkc-l':''}`} title={h?.n||'TBD'}>
        <span className="bkc-flag">{h?.f||'?'}</span>
        {big&&<span className="bkc-name">{h?.n||'TBD'}</span>}
        {showNums&&<span className="bkc-num">{sc.hs}</span>}
      </div>
      <div className="bkc-sep">{sep}</div>
      <div className={`bkc-row${aw?' bkc-w':done?' bkc-l':''}`} title={a?.n||'TBD'}>
        <span className="bkc-flag">{a?.f||'?'}</span>
        {big&&<span className="bkc-name">{a?.n||'TBD'}</span>}
        {showNums&&<span className="bkc-num">{sc.as_}</span>}
      </div>
    </div>
  );
}

const SLOT_H = 72;  // px per R32 slot — all other rounds multiply this
const TOTAL_H = 8 * SLOT_H; // 576px

/* ── bracket column ── */
function Col({ ids, G, T, map, spc, conn }) {
  return (
    <div className="bkx-col">
      <div className="bkx-col-body" style={{height:TOTAL_H}}>
        {ids.map(id => (
          <div
            key={id}
            className={`bkx-slot${conn?' bkx-conn-'+conn:''}`}
            style={{height:spc*SLOT_H}}
          >
            <Card game={G[id]} T={T} map={map} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── main component ── */
export default function BracketView({ T }) {
  const [map, setMap] = useState({});

  useEffect(() => {
    const today = new Date().toISOString().slice(0,10).replace(/-/g,'');
    async function load() {
      const upd = {};
      for (const d of ALL_DATES) {
        if (d > today) continue;
        try {
          const scores = await loadScores(d);
          for (const s of scores) upd[`${s.homeName}-${s.awayName}`] = s;
        } catch {}
      }
      setMap(p => ({...p,...upd}));
    }
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const G = useMemo(() => buildState(map, T), [map, T]);

  const fg = G['final'];
  const fsc = fg ? getScore(fg, map, T) : null;
  const champCode = fsc?.status==='final'
    ? (parseInt(fsc.hs)>parseInt(fsc.as_) ? fg.h : fg.a)
    : null;
  const champ = champCode ? T[champCode] : null;

  const allRounds = [
    { label:'Round of 32',    ids:[...BRACKET_ORDER.topHalf,...BRACKET_ORDER.bottomHalf] },
    { label:'Round of 16',   ids:[...BRACKET_ORDER.topR16,...BRACKET_ORDER.bottomR16]   },
    { label:'Quarter-finals', ids:[...BRACKET_ORDER.topQF,...BRACKET_ORDER.bottomQF]     },
    { label:'Semi-finals',    ids:['sf-1','sf-2']                                        },
    { label:'Final',          ids:['final']                                               },
  ];

  return (
    <div className="bkx-outer">

      {/* ── DESKTOP BRACKET ── */}
      <div className="bkx-scroll">
        {/* Column headers */}
        <div className="bkx-labels">
          <div className="bkx-lbl">R32</div>
          <div className="bkx-lbl">R16</div>
          <div className="bkx-lbl">QF</div>
          <div className="bkx-lbl">SF</div>
          <div className="bkx-lbl bkx-lbl-final">🏆 FINAL</div>
          <div className="bkx-lbl">SF</div>
          <div className="bkx-lbl">QF</div>
          <div className="bkx-lbl">R16</div>
          <div className="bkx-lbl">R32</div>
        </div>

        <div className="bkx-bracket">
          {/* ── LEFT SIDE (R32 → R16 → QF → SF, advances rightward) ── */}
          <Col ids={BRACKET_ORDER.topHalf} G={G} T={T} map={map} spc={1} conn={null}   />
          <Col ids={BRACKET_ORDER.topR16}  G={G} T={T} map={map} spc={2} conn="left"  />
          <Col ids={BRACKET_ORDER.topQF}   G={G} T={T} map={map} spc={4} conn="left"  />
          <Col ids={['sf-1']}              G={G} T={T} map={map} spc={8} conn="left"  />

          {/* ── CENTER: Trophy + Final ── */}
          <div className="bkx-center">
            {champ ? (
              <>
                <div className="bkx-champ-flag">{champ.f}</div>
                <div className="bkx-champ-name">{champ.n}</div>
                <div className="bkx-champ-lbl">World Champions</div>
                <div className="bkx-trophy-sm">🏆</div>
              </>
            ) : (
              <div className="bkx-trophy">🏆</div>
            )}
            <Card game={fg} T={T} map={map} big />
            <div className="bkx-final-meta">
              <div>{fg?.ds}</div>
              <div>{fg?.v}</div>
            </div>
          </div>

          {/* ── RIGHT SIDE (SF → QF → R16 → R32, advances leftward) ── */}
          <Col ids={['sf-2']}                 G={G} T={T} map={map} spc={8} conn="right" />
          <Col ids={BRACKET_ORDER.bottomQF}   G={G} T={T} map={map} spc={4} conn="right" />
          <Col ids={BRACKET_ORDER.bottomR16}  G={G} T={T} map={map} spc={2} conn="right" />
          <Col ids={BRACKET_ORDER.bottomHalf} G={G} T={T} map={map} spc={1} conn={null}  />
        </div>
      </div>

      {/* ── MOBILE: vertical round list ── */}
      <div className="bkx-mobile">
        {allRounds.map(({label, ids}) => (
          <div key={label} className="bkx-m-round">
            <div className="bkx-m-hd">{label}</div>
            <div className="bkx-m-grid">
              {ids.map(id => <Card key={id} game={G[id]} T={T} map={map} big />)}
            </div>
          </div>
        ))}
        {champ && (
          <div className="bkx-m-champ">
            <div className="bkx-champ-flag">{champ.f}</div>
            <div className="bkx-champ-name">{champ.n}</div>
            <div className="bkx-champ-lbl">🏆 World Champions</div>
          </div>
        )}
      </div>

    </div>
  );
}
