import { motion } from 'framer-motion';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CHECKED = [true, true, true, true, true, false, false];
const TODAY_IDX = 4;

export default function WeekStrip() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.05 }}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--sp-3) var(--sp-4)',
        background: 'var(--bg-base)',
      }}
    >
      {DAYS.map((d, i) => {
        const isToday = i === TODAY_IDX;
        const checked = CHECKED[i];
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {isToday && (
              <div style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'var(--text-secondary)',
                marginBottom: -2,
              }} />
            )}
            <span style={{
              fontSize: 12,
              fontWeight: 'var(--fw-semibold)',
              color: isToday ? 'var(--text-primary)' : 'var(--text-muted)',
              letterSpacing: '0.05em',
            }}>
              {d}
            </span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: `1.5px solid ${checked ? 'var(--text-secondary)' : 'var(--border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
            }}>
              {checked && (
                <span style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1 }}>✓</span>
              )}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
