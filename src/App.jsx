import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Header';
import WeekStrip from './components/WeekStrip';
import CaloriesCard from './components/CaloriesCard';
import MacrosCard from './components/MacrosCard';
import DiarySection from './components/DiarySection';
import BottomNav from './components/BottomNav';
import FAB from './components/FAB';
import './styles/globals.css';
import './styles/tokens.css';

export default function App() {
  const { user, loading, login, signup, logout } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);
  const [activeNav, setActiveNav] = useState('today');

  const handleAuth = async (email, password, mode) => {
    setAuthLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await signup(email, password);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
      }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
      </div>
    );
  }

  if (!user) return <LoginForm onSubmit={handleAuth} isLoading={authLoading} />;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      fontFamily: 'var(--font-body)',
    }}>
      {/* Centered mobile shell */}
      <div style={{ maxWidth: 390, margin: '0 auto', position: 'relative' }}>
        <Header onLogout={logout} />
        <WeekStrip />

        <main style={{
          padding: 'var(--sp-3) var(--sp-4)',
          paddingBottom: 'calc(80px + var(--sp-6))',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-3)',
        }}>
          <CaloriesCard consumed={1544} goal={2401} />
          <MacrosCard />
          <DiarySection />
        </main>

        <BottomNav active={activeNav} onChange={setActiveNav} />
        <FAB />
      </div>
    </div>
  );
}
