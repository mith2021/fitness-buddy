import { motion } from 'framer-motion';

const MEALS = [
  { id: 'breakfast', label: 'Breakfast', icon: '☕', summary: 'Eggs and 6 more', calories: 688 },
  { id: 'lunch',     label: 'Lunch',     icon: '🥗', summary: 'Mixed Vegetables and 5 more', calories: 521 },
  { id: 'dinner',    label: 'Dinner',    icon: '🍽️', summary: 'Add food', calories: null },
  { id: 'snacks',    label: 'Snacks',    icon: '🍎', summary: 'Add food', calories: null },
];

function MealRow({ icon, label, summary, calories }) {
  const hasFood = calories !== null;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-3)',
      padding: 'var(--sp-3) var(--sp-4)',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-card)',
    }}>
      <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{icon}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          color: 'var(--text-primary)',
          fontSize: 16,
          fontWeight: 'var(--fw-semibold)',
          marginBottom: 2,
        }}>
          {label}
        </p>
        <p style={{
          color: hasFood ? 'var(--text-secondary)' : 'var(--text-muted)',
          fontSize: 13,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {summary}
          {hasFood && <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>{calories} cal</span>}
        </p>
      </div>

      <button style={{
        background: 'var(--color-blue)',
        color: 'var(--text-primary)',
        border: 'none',
        borderRadius: 'var(--radius-pill)',
        padding: '6px 18px',
        fontSize: 14,
        fontWeight: 'var(--fw-bold)',
        cursor: 'pointer',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}>
        Log
      </button>
    </div>
  );
}

export default function DiarySection({ meals = MEALS }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.14 }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--sp-3)',
        padding: '0 var(--sp-1)',
      }}>
        <h2 style={{
          color: 'var(--text-primary)',
          fontSize: 20,
          fontWeight: 'var(--fw-bold)',
          fontFamily: 'var(--font-body)',
        }}>
          Diary
        </h2>
        <button style={{
          color: 'var(--text-secondary)',
          fontSize: 14,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}>
          View all
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        {meals.map(m => <MealRow key={m.id} {...m} />)}
      </div>
    </motion.div>
  );
}
