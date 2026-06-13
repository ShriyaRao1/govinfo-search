import { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';

const API_URL = '/api/chat';

// Max messages stored in history (10 = 5 turns)
const MAX_HISTORY = 10;

const SOURCE_LABELS = {
  db:   { icon: '🗄️', text: 'From our database',   cls: 'chat-source-badge--db'   },
  web:  { icon: '🌐', text: 'From web search',      cls: 'chat-source-badge--web'  },
  none: { icon: '❌', text: 'No results found',     cls: 'chat-source-badge--none' },
};

export default function ChatWidget() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([]);   // { role, text, source? }
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef         = useRef(null);
  const inputRef               = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    // Build history from the last MAX_HISTORY messages (excluding the one we just added)
    const history = messages
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Request failed');
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.reply, source: data.source },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          source: 'none',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Floating toggle button ─────────────────────────── */}
      <button
        id="chat-toggle-btn"
        className="chat-toggle-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        title="GovInfo Assistant"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* ── Chat panel ────────────────────────────────────── */}
      {open && (
        <div className="chat-panel" role="dialog" aria-label="GovInfo Chat Assistant">
          {/* Header */}
          <div className="chat-header">
            <div>
              <div className="chat-header-title">🏛️ GovInfo Assistant</div>
              <div className="chat-header-subtitle">Ask about notifications, schemes & more</div>
            </div>
            <button
              className="chat-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Message list */}
          <div className="chat-messages" id="chat-messages-list">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <span className="chat-welcome-icon">🤖</span>
                Hi! Ask me anything about government notifications, exams, scholarships, or schemes.
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-msg chat-msg--${msg.role}`}
                id={`chat-msg-${i}`}
              >
                <div className="chat-bubble">{msg.text}</div>
                {msg.role === 'assistant' && msg.source && SOURCE_LABELS[msg.source] && (
                  <span className={`chat-source-badge ${SOURCE_LABELS[msg.source].cls}`}>
                    {SOURCE_LABELS[msg.source].icon} {SOURCE_LABELS[msg.source].text}
                  </span>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="chat-msg chat-msg--assistant" id="chat-typing-indicator">
                <div className="chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input row */}
          <div className="chat-input-row">
            <textarea
              id="chat-input"
              ref={inputRef}
              className="chat-input"
              placeholder="Ask a question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
              aria-label="Chat message input"
            />
            <button
              id="chat-send-btn"
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
