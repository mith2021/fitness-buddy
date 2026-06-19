import { useState } from 'react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Card from '../UI/Card';

export default function LoginForm({ onSubmit, isLoading = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password required');
      return;
    }

    try {
      await onSubmit(email, password, mode);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </h2>

        {error && <div className="bg-red-900 text-red-100 p-3 rounded mb-4">{error}</div>}

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
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-sm text-green-400 hover:text-green-300"
          >
            {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
          </button>
        </div>
      </Card>
    </div>
  );
}
