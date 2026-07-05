'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

const SUGGESTIONS = [
  'Who are the top scorers so far?',
  "What's the biggest upset of the tournament?",
  'Which teams have already been eliminated?',
  'Who should I watch in the Round of 16?',
  "What's Spain vs Portugal all about?",
  'Which goalkeeper has been the best?',
];

function Cursor() {
  return <span className="chat-cursor" aria-hidden="true" />;
}

export default function TournamentChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [leaders, setLeaders] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Pre-fetch leaders once so the chat API doesn't need to call ESPN itself
  useEffect(() => {
    fetch('/api/leaders').then(r => r.json()).then(setLeaders).catch(() => {});
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const send = useCallback(async (text) => {
    const q = text.trim();
    if (!q || streaming) return;
    setInput('');

    const next = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setStreaming(true);

    // Add empty assistant placeholder
    setMessages(m => [...m, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(msg => ({ role: msg.role, content: msg.content })),
          leaders,
        }),
      });

      if (!res.ok || !res.body) throw new Error('Stream failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages(m => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: acc };
          return copy;
        });
      }
    } catch {
      setMessages(m => {
        const copy = [...m];
        copy[copy.length - 1] = { role: 'assistant', content: 'Something went wrong. Try again.' };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming]);

  function handleSubmit(e) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        className={`chat-fab ${open ? 'chat-fab-open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close chat' : 'Ask the Tournament — AI analyst'}
      >
        {open ? '✕' : <><span className="chat-fab-icon">✦</span><span className="chat-fab-label">Ask AI</span></>}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="chat-panel" role="dialog" aria-label="WC26 AI Analyst">
          <div className="chat-header">
            <div>
              <div className="chat-title">WC26 Analyst</div>
              <div className="chat-subtitle">Powered by Claude · Live tournament data</div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          <div className="chat-body">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <div className="chat-empty-icon">✦</div>
                <div className="chat-empty-title">Ask me anything about WC26</div>
                <div className="chat-suggestions">
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} className="chat-suggestion" onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
                  {msg.role === 'assistant' && !msg.content && streaming ? (
                    <span className="chat-thinking">Thinking<Cursor /></span>
                  ) : (
                    <>
                      {msg.content}
                      {msg.role === 'assistant' && i === messages.length - 1 && streaming && <Cursor />}
                    </>
                  )}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about scores, players, form…"
              disabled={streaming}
            />
            <button className="chat-send" type="submit" disabled={!input.trim() || streaming} aria-label="Send">
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}
