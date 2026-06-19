export default function FAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Add food"
      style={{
        position: 'fixed',
        bottom: 'calc(64px + var(--sp-4) + max(0px, env(safe-area-inset-bottom)))',
        right: 'var(--sp-4)',
        width: 56,
        height: 56,
        borderRadius: 'var(--radius-fab)',
        background: 'var(--bg-fab)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
        zIndex: 60,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.08)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.55)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.4)';
      }}
    >
      <span style={{ color: '#fff', fontSize: 28, lineHeight: 1, marginTop: -1 }}>+</span>
    </button>
  );
}
