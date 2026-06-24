import { useEffect, useRef, useState } from 'react';

export default function CoachFeed({ messages, loading, sending, onSend }) {
  const bottomRef = useRef(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, sending]);

  const isEmpty = !messages.length && !loading;

  const submit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    onSend(text);
    setInput('');
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#00a0d2] flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">AI Coach</p>
          <p className="text-xs text-gray-400">Ask about your day</p>
        </div>
        {(loading || sending) && (
          <div className="ml-auto flex gap-1 items-center">
            <span className="w-1.5 h-1.5 bg-[#00a0d2] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-[#00a0d2] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-[#00a0d2] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="text-center py-6">
          <p className="text-gray-400 text-sm">Sync your meals, then ask the coach anything.</p>
          <p className="text-gray-500 text-xs mt-1">"How much protein do I have left?" · "Is my lunch too high in carbs?"</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-3">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${isUser ? 'bg-gray-600' : 'bg-[#00a0d2]'}`}>
                  <span className="text-xs font-bold text-white">{isUser ? 'You' : 'V'}</span>
                </div>
                <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
                  <p className={`text-sm leading-relaxed inline-block px-3 py-2 rounded-2xl ${isUser ? 'bg-gray-700 text-white' : 'text-white'}`}>
                    {msg.coach_message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      <form onSubmit={submit} className="flex gap-2 mt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your coach…"
          className="input-field flex-1 text-sm"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="btn-primary text-sm px-4 py-2 rounded-full disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
