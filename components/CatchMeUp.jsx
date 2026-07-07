'use client';
import { useState, useEffect } from 'react';

export default function CatchMeUp() {
  const [state, setState] = useState('idle'); // idle | loading | done | dismissed
  const [text, setText] = useState('');
  const [leaders, setLeaders] = useState(null);

  useEffect(() => {
    fetch('/api/leaders').then(r => r.json()).then(setLeaders).catch(() => {});
    const dismissed = sessionStorage.getItem('catchup-dismissed');
    if (dismissed) setState('dismissed');
  }, []);

  async function generate() {
    setState('loading');
    setText('');
    try {
      const res = await fetch('/api/catchup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaders }),
      });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setText(acc);
      }
      setState('done');
    } catch {
      setText('Could not generate summary. Please try again.');
      setState('done');
    }
  }

  function dismiss() {
    sessionStorage.setItem('catchup-dismissed', '1');
    setState('dismissed');
  }

  if (state === 'dismissed') return null;

  return (
    <div className="catchup-card">
      <button className="catchup-dismiss" onClick={dismiss} aria-label="Dismiss">✕</button>

      {state === 'idle' && (
        <div className="catchup-idle">
          <div className="catchup-badge">✦ AI</div>
          <div className="catchup-copy">
            <div className="catchup-title">Not a football fan?</div>
            <div className="catchup-sub">Get caught up on the entire tournament in 30 seconds — no football knowledge needed.</div>
          </div>
          <button className="catchup-btn" onClick={generate}>Catch me up</button>
        </div>
      )}

      {state === 'loading' && (
        <div className="catchup-generating">
          <span className="catchup-spinner" />
          <span className="catchup-gen-label">Writing your briefing…</span>
        </div>
      )}

      {state === 'done' && (
        <div className="catchup-result">
          <div className="catchup-result-header">
            <span className="catchup-badge">✦ AI Briefing</span>
            <button className="catchup-again" onClick={generate}>Regenerate</button>
          </div>
          <p className="catchup-text">{text}<span className="catchup-cursor" /></p>
        </div>
      )}
    </div>
  );
}
