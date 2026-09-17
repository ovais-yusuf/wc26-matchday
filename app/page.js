'use client';
import { useState, useEffect } from 'react';
import { T, M, M2, M3, KO, R16, QF, SF, FINAL } from '../lib/staticData';
import { TOURNAMENT_THEMES } from '../lib/editorial';
import MatchExplorer from '../components/MatchExplorer';
import TournamentLeaders from '../components/TournamentLeaders';
import GroupStandings from '../components/GroupStandings';
import KnockoutBracket from '../components/KnockoutBracket';
import BracketView from '../components/BracketView';
import TournamentChat from '../components/TournamentChat';
import CatchMeUp from '../components/CatchMeUp';

const THEME_TONE = {
  gold: { color: 'var(--gold)', border: 'rgba(243,200,104,.35)', bg: 'rgba(243,200,104,.06)' },
  teal: { color: 'var(--teal)', border: 'rgba(79,224,204,.35)', bg: 'rgba(79,224,204,.06)' },
  coral: { color: 'var(--coral)', border: 'rgba(255,122,107,.35)', bg: 'rgba(255,122,107,.06)' },
};

function ThemeCard({ t }) {
  const s = THEME_TONE[t.tone] || THEME_TONE.gold;
  return (
    <div className="thcard" style={{ borderColor: s.border, background: `linear-gradient(180deg, ${s.bg}, transparent)` }}>
      <div className="thcard-label" style={{ color: s.color }}>{t.label}</div>
      <div className="thcard-pick">{t.pick}</div>
      <p className="thcard-detail">{t.detail}</p>
    </div>
  );
}

function useTournamentSnapshot() {
  const [snap, setSnap] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [ldRes, stRes] = await Promise.all([
          fetch('/api/leaders'),
          fetch('/api/standings'),
        ]);
        const ld = await ldRes.json();
        const st = await stRes.json();

        // Top scorer
        const top = ld.scorers?.[0];
        const topScorer = top
          ? `${top.shortName || top.name} · ${top.goals} goal${top.goals !== 1 ? 's' : ''}`
          : null;

        // Already qualified (6 pts from 2 played) and on the brink (0 pts, 2 played)
        const qualified = [];
        const brink = [];
        for (const rows of Object.values(st.groups || {})) {
          for (const row of rows) {
            const team = T[row.code];
            if (!team) continue;
            if (row.p >= 2 && row.pts === 6) qualified.push(team.n);
            if (row.p >= 2 && row.pts === 0) brink.push(team.n);
          }
        }

        setSnap({
          topScorer,
          qualified: qualified.length ? qualified.join(' · ') : null,
          brink: brink.length ? brink.join(' · ') : null,
        });
      } catch {
        // silently fall back to defaults
      }
    }
    load();
  }, []);

  return snap;
}

export default function Page() {
  const [statsOpen, setStatsOpen] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState('final');
  const [theme, setTheme] = useState('light');
  const snap = useTournamentSnapshot();

  // Sync with localStorage on mount, respecting any previously saved preference
  useEffect(() => {
    const saved = localStorage.getItem('wc26-theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('wc26-theme', next);
  }

  return (
    <>
      <header className="top">
        <div className="topbar">
          <div className="mark">
            <div className="glyph">WC<b>26</b></div>
            <div className="sub">Matchday&nbsp;Intelligence</div>
          </div>
          <div className="host">Jun 11 to Jul 19 · <b>USA</b> · <b>CAN</b> · <b>MEX</b></div>
          <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle colour theme">
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
        <div className="tabs" role="tablist" aria-label="Matchday">
          <button className="tab" role="tab" aria-selected={activeMainTab === 'matchday'} onClick={() => setActiveMainTab('matchday')}>MD1</button>
          <button className="tab" role="tab" aria-selected={activeMainTab === 'md2'} onClick={() => setActiveMainTab('md2')}>MD2</button>
          <button className="tab" role="tab" aria-selected={activeMainTab === 'md3'} onClick={() => setActiveMainTab('md3')}>MD3</button>
          <button className="tab" role="tab" aria-selected={activeMainTab === 'knockouts'} onClick={() => setActiveMainTab('knockouts')}>Round of 32</button>
          <button className="tab" role="tab" aria-selected={activeMainTab === 'r16'} onClick={() => setActiveMainTab('r16')}>Round of 16</button>
          <button className="tab" role="tab" aria-selected={activeMainTab === 'qf'} onClick={() => setActiveMainTab('qf')}>Quarter-finals</button>
          <button className="tab" role="tab" aria-selected={activeMainTab === 'sf'} onClick={() => setActiveMainTab('sf')}>Semi-finals</button>
          <button className="tab" role="tab" aria-selected={activeMainTab === 'final'} onClick={() => setActiveMainTab('final')}>🏆 Final</button>
          <button className="tab" role="tab" aria-selected={activeMainTab === 'bracket'} onClick={() => setActiveMainTab('bracket')}>Bracket</button>
          <button className="tab tab-stats" role="tab" aria-selected={activeMainTab === 'standings'} onClick={() => setActiveMainTab('standings')} style={{ marginLeft: 'auto' }}>📊 Standings</button>
          <button className="tab tab-stats" role="tab" aria-selected={activeMainTab === 'stats'} onClick={() => setActiveMainTab('stats')}>🏅 Stats</button>
        </div>
      </header>

      <main className="wrap">
        <CatchMeUp />
        {activeMainTab === 'matchday' && (
          <>
            <section className="hero">
              <div className="eyebrow">FIFA World Cup 26 · Matchday 1</div>
              <h1>Matchday 1 is in the books.</h1>
              <p>Matchday 1 is done. All 24 opening fixtures are wrapped up with results, match reports, lineups and full player stats. Tap any fixture to read the full breakdown of what actually happened.</p>
              <div className="ctx">
                <div className="pill"><span>Top scorer</span><b>{snap?.topScorer ?? 'Loading…'}</b></div>
                <div className="pill"><span>Biggest result</span><b>Germany 7–1 Curaçao</b></div>
                {snap?.qualified && <div className="pill"><span>Through early</span><b>{snap.qualified}</b></div>}
                {snap?.brink && <div className="pill"><span>Went out early</span><b>{snap.brink}</b></div>}
              </div>
            </section>

            <section className="themes">
              <div className="themes-hd">
                <h2>What the tournament has told us</h2>
                <div className="rule" />
              </div>
              <div className="themes-grid">
                {TOURNAMENT_THEMES.map((t, i) => <ThemeCard key={i} t={t} />)}
              </div>
            </section>

            <MatchExplorer T={T} M={M} />

            <p className="scope" style={{ marginTop: 38 }}>
              Pre-match notes still live in each fixture&apos;s preview tab. Open a match for the result and the full report.
            </p>
          </>
        )}

        {activeMainTab === 'md2' && (
          <>
            <section className="hero">
              <div className="eyebrow">FIFA World Cup 26 · Matchday 2</div>
              <h1>Matchday 2 is in the books.</h1>
              <p>Twenty-four more group games, and the tables took shape. Open any fixture for the score, the match report, and the full tactical write-up.</p>
              <div className="ctx">
                <div className="pill"><span>Dates</span><b>June 18 <i>–</i> June 23</b></div>
                <div className="pill"><span>Matches</span><b>24 fixtures · 12 groups</b></div>
                <div className="pill"><span>Stakes</span><b>Early qualification spots decided</b></div>
                <div className="pill"><span>Watch</span><b>Haaland · Messi · Son · Mbappé</b></div>
              </div>
            </section>
            <MatchExplorer T={T} M={M2} />
            <p className="scope" style={{ marginTop: 38 }}>
              Pre-match notes still live in the preview tab. Open a fixture for the result and the full match report.
            </p>
          </>
        )}

        {activeMainTab === 'md3' && (
          <>
            <section className="hero">
              <div className="eyebrow">FIFA World Cup 26 · Matchday 3</div>
              <h1>The group stage is over.</h1>
              <p>Both games in every group kicked off together. Qualification, elimination and seeding were settled across 24 matches. Tap any fixture for the result and the report.</p>
              <div className="ctx">
                <div className="pill"><span>Dates</span><b>June 24 to June 29</b></div>
                <div className="pill"><span>Format</span><b>Both group games simultaneous</b></div>
                <div className="pill"><span>Match of the round</span><b>Norway vs France</b></div>
                <div className="pill"><span>Storyline</span><b>Ronaldo needs goals · Spain's real test</b></div>
              </div>
            </section>
            <MatchExplorer T={T} M={M3} />
            <p className="scope" style={{ marginTop: 38 }}>
              Both games in each group kicked off at the same time. Open a match for the score and the full report.
            </p>
          </>
        )}

        {activeMainTab === 'standings' && (
          <>
            <section className="hero">
              <div className="eyebrow">FIFA World Cup 26 · Group Stage</div>
              <h1>Final Group Standings</h1>
              <p>The group stage is complete. 32 teams advance to the Round of 32, with the eight best third-placed teams joining the 12 group winners and 12 runners-up.</p>
            </section>
            <GroupStandings />
          </>
        )}

        {activeMainTab === 'knockouts' && (
          <>
            <section className="hero">
              <div className="eyebrow">FIFA World Cup 26 · Round of 32</div>
              <h1>The Round of 32 is complete.</h1>
              <p>The group stage gave way to 16 knockout ties. Canada opened it by eliminating South Africa. Tap any fixture for the match report, lineups and stats.</p>
            </section>
            <MatchExplorer T={T} M={KO} />
          </>
        )}

        {activeMainTab === 'r16' && (
          <>
            <section className="hero">
              <div className="eyebrow">FIFA World Cup 26 · Round of 16</div>
              <h1>The last 16 is complete.</h1>
              <p>Spain beat Portugal, Morocco knocked out Canada, England saw off Mexico, and Argentina beat Egypt. Tap any fixture for the report, lineups and stats.</p>
              <div className="ctx">
                <div className="pill"><span>Dates</span><b>Jul 4 to Jul 7</b></div>
                <div className="pill"><span>Match of the round</span><b>Spain vs Portugal</b></div>
                <div className="pill"><span>Upset watch</span><b>Morocco vs Canada</b></div>
                <div className="pill"><span>Home support</span><b>Mexico at Estadio Banorte</b></div>
              </div>
            </section>
            <MatchExplorer T={T} M={R16} />
          </>
        )}

        {activeMainTab === 'qf' && (
          <>
            <section className="hero">
              <div className="eyebrow">FIFA World Cup 26 · Quarter-finals</div>
              <h1>The last eight is history.</h1>
              <p>France ended Morocco&apos;s run, Spain edged Belgium, England saw off Haaland&apos;s Norway, and Argentina beat Switzerland. Spain would go on to win the World Cup. Tap any tie for the report, lineups and stats.</p>
              <div className="ctx">
                <div className="pill"><span>Dates</span><b>Jul 9 to Jul 11</b></div>
                <div className="pill"><span>Semi-finalists</span><b>FRA · ESP · ENG · ARG</b></div>
                <div className="pill"><span>Gone</span><b>Morocco · Belgium · Norway · Switzerland</b></div>
              </div>
            </section>
            <MatchExplorer T={T} M={QF} />
          </>
        )}

        {activeMainTab === 'sf' && (
          <>
            <section className="hero">
              <div className="eyebrow">FIFA World Cup 26 · Semi-finals</div>
              <h1>The semi-finals are done.</h1>
              <p>Spain beat France 2–0. Argentina beat England 2–1. Those two met in the Final — and Spain are world champions. Tap either tie for the report, lineups and stats.</p>
              <div className="ctx">
                <div className="pill"><span>Dates</span><b>Jul 14 <i>&amp;</i> Jul 15</b></div>
                <div className="pill"><span>Spain 2–0 France</span><b>Spain through</b></div>
                <div className="pill"><span>Argentina 2–1 England</span><b>Argentina through</b></div>
                <div className="pill"><span>Final</span><b>Spain 1–0 Argentina · AET</b></div>
              </div>
            </section>
            <MatchExplorer T={T} M={SF} />
          </>
        )}

        {activeMainTab === 'final' && (
          <>
            <section className="hero">
              <div className="eyebrow">FIFA World Cup 26 · The Final</div>
              <h1>Spain are world champions.</h1>
              <p>Spain beat Argentina 1–0 after extra time at MetLife Stadium on July 19. Forty-eight teams, one winner. Tap the match for the full report, lineups and stats.</p>
              <div className="ctx">
                <div className="pill"><span>Champion</span><b>Spain</b></div>
                <div className="pill"><span>Final</span><b>Spain 1–0 Argentina · AET</b></div>
                <div className="pill"><span>Venue</span><b>MetLife Stadium, NJ</b></div>
                <div className="pill"><span>Date</span><b>Sunday, July 19</b></div>
              </div>
            </section>
            <MatchExplorer T={T} M={FINAL} />
            <p className="scope" style={{ marginTop: 38 }}>
              The 2026 FIFA World Cup is over. Open the final for the match report.
            </p>
          </>
        )}

        {activeMainTab === 'bracket' && (
          <>
            <section className="hero">
              <div className="eyebrow">FIFA World Cup 26 · Tournament Bracket</div>
              <h1>Spain&apos;s path to the trophy.</h1>
              <p>Every knockout game in one view, from the Round of 32 to Spain&apos;s extra-time win over Argentina in the Final. The 2026 World Cup is complete.</p>
              <div className="ctx">
                <div className="pill"><span>Champion</span><b>Spain</b></div>
                <div className="pill"><span>Final</span><b>Spain 1–0 Argentina · AET</b></div>
                <div className="pill"><span>Venue</span><b>MetLife Stadium, NJ</b></div>
              </div>
            </section>
            <BracketView T={T} />
          </>
        )}

        {activeMainTab === 'stats' && (
          <TournamentLeaders fullPage onSeeAll={() => {}} />
        )}
      </main>

      <TournamentChat />

      <footer className="foot">
        <div className="wrap">
          <div className="foot-credit">
            <span className="foot-built">Built by</span>
            <span className="foot-name">Muhammad Ovais Yusuf</span>
            <a
              className="foot-link"
              href="https://www.linkedin.com/in/muhammadovaisyusuf/"
              target="_blank"
              rel="noopener noreferrer"
            >LinkedIn ↗</a>
          </div>
          <p><b>Data.</b> The 2026 FIFA World Cup is over. Fixtures, kickoff times (US Eastern) and venues were hand-verified. Squads, starting lineups and player profiles come from ESPN&apos;s public feed. Every result, report and squad is here to look back on.</p>
        </div>
      </footer>
    </>
  );
}
