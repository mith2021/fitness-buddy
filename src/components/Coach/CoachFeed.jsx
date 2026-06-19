import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CoachFeed({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!messages.length && !loading) return null;

  return (
    <div className="card">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Coach</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="text-sm text-white leading-relaxed bg-[#0d1b2a] rounded-lg px-3 py-2"
            >
              {msg.coach_message}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="text-sm text-gray-400 animate-pulse px-3 py-2">Thinking...</div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
