import React, { useState } from 'react';
import { authClient } from './AuthProvider';

interface LoginFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
}

export default function LoginForm({ redirectTo = '/', onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        // Map any sign-in error to a generic message to avoid leaking account existence
        setError('Invalid email or password');
      } else {
        onSuccess?.();
        window.location.href = redirectTo;
      }
    } catch {
      setError('Sign-in failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Log in</h2>

      {error && (
        <div style={{ color: 'red', marginBottom: 12, padding: '8px', background: '#fff0f0', borderRadius: 4 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: 4 }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{ padding: '10px 24px', cursor: loading ? 'wait' : 'pointer' }}
      >
        {loading ? 'Signing in…' : 'Log in'}
      </button>

      <p style={{ marginTop: 16, fontSize: 14 }}>
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
    </form>
  );
}
