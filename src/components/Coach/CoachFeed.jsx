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
      <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">Coach</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="text-sm text-white leading-relaxed"
            >
              {msg.coach_message}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="text-sm text-secondary animate-pulse">Thinking...</div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
