export default function Header({ user, onLogout }) {
  return (
    <header className="bg-bg-secondary border-b border-gray-700 py-4 px-6">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white font-heading">Verdict</h1>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-secondary">{user.email}</span>
            <button
              onClick={onLogout}
              className="text-sm text-accent-primary hover:text-blue-400"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
