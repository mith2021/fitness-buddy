import { useState } from 'react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Card from '../UI/Card';

export default function LoginForm({ onSubmit, isLoading = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!email || !password) {
      setError('Email and password required');
      return;
    }

    try {
      const result = await onSubmit(email, password, mode);
      if (mode === 'signup' && result?.needsConfirmation) {
        setNotice('Account created. Check your email to confirm, then sign in.');
        setMode('login');
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Verdict</h1>
          <p className="text-gray-400 text-sm mt-1">Your daily nutrition coach</p>
        </div>
      <Card className="w-full">
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h2>

        {error && <div className="bg-red-900 text-red-100 p-3 rounded mb-4">{error}</div>}
        {notice && <div className="bg-[#0e3a4a] text-[#7fd6ef] p-3 rounded mb-4">{notice}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
          />

          <Button disabled={isLoading} className="w-full">
            {isLoading ? 'Loading...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setNotice(''); }}
            className="text-sm text-[#00a0d2] hover:text-[#33b5de] min-h-[44px] px-4"
          >
            {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
          </button>
        </div>
      </Card>
      </div>
    </div>
  );
}
