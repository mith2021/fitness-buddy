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
      if (mode === 'login') await login(email, password);
      else await signup(email, password);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a2332' }}>
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!user) return <LoginForm onSubmit={handleAuth} isLoading={authLoading} />;

  const noMfpCreds = !prefs.mfp_username || !prefs.mfp_password;

  return (
    <div className="min-h-screen" style={{ background: '#1a2332' }}>
      <Header user={user} onLogout={logout} onSettings={() => setShowSettings(true)} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-3">
        {noMfpCreds && (
          <div
            className="card text-center cursor-pointer border-blue-500/50 hover:border-blue-500"
            onClick={() => setShowSettings(true)}
          >
            <p className="text-white font-medium">Connect MyFitnessPal →</p>
            <p className="text-secondary text-sm mt-1">Add credentials to start syncing</p>
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
