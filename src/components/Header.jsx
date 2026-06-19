import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border)',
        padding: 'var(--sp-4)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-1)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <span style={{ color: 'var(--text-primary)', fontSize: 28, fontWeight: 'var(--fw-bold)', fontFamily: 'var(--font-body)' }}>
            Today
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>▾</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: 'var(--text-primary)',
            fontWeight: 'var(--fw-bold)',
            fontSize: 16,
          }}>
            <span>24</span>
            <span style={{ color: 'var(--color-gold)' }}>⚡</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
