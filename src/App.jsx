import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useFoodLog } from './hooks/useFoodLog';
import { usePreferences } from './hooks/usePreferences';
import { useCoach } from './hooks/useCoach';
import LoginForm from './components/Auth/LoginForm';
import SettingsForm from './components/Auth/SettingsForm';
import Header from './components/Layout/Header';
import DailyTotal from './components/FoodLog/DailyTotal';
import MealList from './components/FoodLog/MealList';
import CoachFeed from './components/Coach/CoachFeed';
import './styles/globals.css';

export default function App() {
  const { user, loading, login, signup, logout } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { logs, totalCalories, totalProtein, totalCarbs, totalFat } = useFoodLog(user?.id);
  const { prefs, save: savePrefs } = usePreferences(user?.id);
  const { messages, loading: coachLoading } = useCoach(user?.id, logs, prefs);

  const handleAuth = async (email, password, mode) => {
    setAuthLoading(true);
    try {
      if (mode === 'login') return await login(email, password);
      return await signup(email, password);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1b2a]">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!user) return <LoginForm onSubmit={handleAuth} isLoading={authLoading} />;

  const noMfpCreds = !prefs.mfp_username || !prefs.mfp_password;

  return (
    <div className="min-h-screen bg-[#0d1b2a]">
      <Header user={user} onLogout={logout} onSettings={() => setShowSettings(true)} />

      <main className="container-app" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '32px', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        {noMfpCreds && (
          <div
            className="card cursor-pointer hover:border-[#00a0d2] transition-colors"
            onClick={() => setShowSettings(true)}
          >
            <p className="text-white text-lg font-semibold">Connect MyFitnessPal</p>
            <p className="text-gray-400 text-sm mt-1">Sync your meals automatically every 2 hours</p>
            <button className="mt-3 btn-primary text-sm px-4 py-2 rounded-full">
              Connect Now →
            </button>
          </div>
        )}

        <DailyTotal
          totalCalories={totalCalories}
          goalCalories={prefs.daily_goal_calories || 2000}
          totalProtein={totalProtein}
          totalCarbs={totalCarbs}
          totalFat={totalFat}
        />

        <CoachFeed messages={messages} loading={coachLoading} />

        <MealList logs={logs} />
      </main>

      {showSettings && (
        <SettingsForm
          prefs={prefs}
          onSave={savePrefs}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
