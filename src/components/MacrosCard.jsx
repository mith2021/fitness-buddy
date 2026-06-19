import { motion } from 'framer-motion';

const MACROS = [
  { label: 'Carbs',   value: 159, goal: 300, color: 'var(--color-cyan)' },
  { label: 'Fat',     value: 44,  goal: 53,  color: 'var(--color-purple)' },
  { label: 'Protein', value: 138, goal: 180, color: 'var(--color-gold)' },
];

function MacroCol({ label, value, goal, color }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div style={{ flex: 1 }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 'var(--fw-semibold)', marginBottom: 4 }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
        <span style={{
          color: 'var(--text-primary)',
          fontSize: 20,
          fontWeight: 'var(--fw-bold)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value}g
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>/ {goal}</span>
      </div>
      <div style={{
        height: 6,
        background: 'var(--bg-card-deep)',
        borderRadius: 3,
        overflow: 'hidden',
        maxWidth: 100,
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 3,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

export default function MacrosCard({ macros = MACROS }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.11 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--sp-4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-3)' }}>
        {macros.map(m => <MacroCol key={m.label} {...m} />)}
      </div>
    </motion.div>
  );
}
