const NAV_ITEMS = [
  { id: 'today',    label: 'Today',    icon: '⊞' },
  { id: 'plan',     label: 'Plan',     icon: '📅' },
  { id: 'progress', label: 'Progress', icon: '📊' },
  { id: 'more',     label: 'More',     icon: '···' },
];

export default function BottomNav({ active = 'today', onChange }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--bg-nav)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: 'var(--sp-2) var(--sp-4)',
      paddingBottom: 'max(var(--sp-2), env(safe-area-inset-bottom))',
      zIndex: 50,
    }}>
      {NAV_ITEMS.map(item => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            onClick={() => onChange?.(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--sp-1) var(--sp-3)',
              minWidth: 60,
            }}
          >
            <span style={{
              fontSize: isActive ? 22 : 20,
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              lineHeight: 1,
            }}>
              {item.icon}
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: isActive ? 'var(--fw-bold)' : 'var(--fw-normal)',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              letterSpacing: '0.02em',
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
