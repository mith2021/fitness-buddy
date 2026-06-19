export default function Header({ user, onLogout, onSettings }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <header className="sticky top-0 z-40 bg-[#1e2028] border-b border-[#2a2d38] py-4">
      <div className="container-app flex justify-between items-center">
        <div>
          <h1 className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Verdict
          </h1>
          <p className="text-[#8b95a8] text-xs mt-0.5">{today}</p>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <button
              onClick={onSettings}
              className="text-[#8b95a8] hover:text-white transition-colors text-sm"
              aria-label="Settings"
            >
              ⚙
            </button>
            <button
              onClick={onLogout}
              className="text-[#8b95a8] hover:text-white transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
