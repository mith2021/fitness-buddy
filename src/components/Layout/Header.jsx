export default function Header({ user, onLogout, onSettings }) {
  return (
    <header style={{ background: '#252f3d', borderBottom: '1px solid #374151' }} className="py-4 px-6">
      <div className="max-w-lg mx-auto flex justify-between items-center">
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 700 }} className="text-white">
          Verdict
        </h1>
        {user && (
          <div className="flex items-center gap-3">
            <button
              onClick={onSettings}
              className="text-sm text-secondary hover:text-white"
            >
              ⚙
            </button>
            <button
              onClick={onLogout}
              className="text-sm text-secondary hover:text-white"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
