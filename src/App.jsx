import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import Card from './components/UI/Card';
import './styles/globals.css';

export default function App() {
  const { user, loading, login, signup, logout } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async (email, password, mode) => {
    setAuthLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onSubmit={handleAuth} isLoading={authLoading} />;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header user={user} onLogout={logout} />
      <Navigation />

      <main className="max-w-4xl mx-auto p-6">
        <Card className="mb-6">
          <h2 className="text-2xl font-bold text-white font-heading mb-2">Today's Intake</h2>
          <div className="text-4xl font-bold text-accent-primary">0</div>
          <p className="text-secondary text-sm">/ 2000 cal</p>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-white font-heading mb-4">Log a Meal</h3>
          <p className="text-secondary">Meal form coming soon...</p>
        </Card>
      </main>
    </div>
  );
}
