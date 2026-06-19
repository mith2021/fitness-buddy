import { useEffect, useRef } from 'react';

export default function CoachFeed({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const isEmpty = !messages.length && !loading;

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
          <p className="text-xs text-gray-400">Based on your MFP data</p>
        </div>
        {loading && (
          <div className="ml-auto flex gap-1 items-center">
            <span className="w-1.5 h-1.5 bg-[#00a0d2] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-[#00a0d2] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-[#00a0d2] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="text-center py-6">
          <p className="text-gray-400 text-sm">Sync your MFP data to get coaching.</p>
          <p className="text-gray-500 text-xs mt-1">Coach analyzes your meals automatically after each sync.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {messages.map((msg, i) => (
            <div key={msg.id} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#00a0d2] flex-shrink-0 mt-0.5 flex items-center justify-center">
                <span className="text-xs font-bold text-white">V</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-white leading-relaxed">{msg.coach_message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
