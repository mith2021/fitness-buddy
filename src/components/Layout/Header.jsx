export default function Header({ user, onLogout, onSettings }) {
  return (
    <header className="bg-[#1a1a1a] border-b border-[#2a2a2a] py-4">
      <div className="container-app flex justify-between items-center">
        <h1 className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
          Verdict
        </h1>
        {user && (
          <div className="flex items-center gap-4">
            <button
              onClick={onSettings}
              className="text-gray-400 hover:text-white transition-colors text-sm"
              aria-label="Settings"
            >
              ⚙
            </button>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
