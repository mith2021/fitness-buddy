import { motion } from 'framer-motion';

export default function CaloriesCard({ consumed = 1544, goal = 2401 }) {
  const remaining = goal - consumed;
  const over = remaining < 0;
  const pct = Math.min(100, Math.round((consumed / goal) * 100));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.08 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--sp-4)',
      }}
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 'var(--sp-2)' }}>Calories</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--sp-3)' }}>
        {/* Left: consumed + goal */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontSize: 34,
            fontWeight: 'var(--fw-bold)',
            color: 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}>
            {consumed.toLocaleString()}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            cal / {goal.toLocaleString()} 🔥
          </span>
        </div>

        {/* Right: remaining */}
        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontSize: 24,
            fontWeight: 'var(--fw-bold)',
            color: over ? 'var(--color-orange)' : 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {Math.abs(remaining).toLocaleString()}
          </span>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{over ? 'over' : 'left'}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 8,
        background: 'var(--bg-card-deep)',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: over ? 'var(--color-orange)' : 'var(--color-blue)',
          borderRadius: 4,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </motion.div>
  );
}
