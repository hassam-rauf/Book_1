import React, { useState } from 'react';
import { authClient } from './AuthProvider';

const EXPERIENCE_OPTIONS = [
  { value: '', label: 'Select your experience level' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

const HARDWARE_OPTIONS = [
  { value: '', label: 'Select your hardware' },
  { value: 'laptop-only', label: 'Laptop only (CPU)' },
  { value: 'gpu-workstation', label: 'GPU workstation' },
  { value: 'jetson-kit', label: 'NVIDIA Jetson kit' },
  { value: 'robot', label: 'Physical robot' },
] as const;

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'اردو (Urdu)' },
] as const;

interface SignupFormProps {
  onSuccess?: () => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    experienceLevel: '',
    programmingBackground: '',
    hardware: '',
    preferredLanguage: 'en',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!form.experienceLevel) {
      setError('Please select an experience level');
      return;
    }
    if (!form.hardware) {
      setError('Please select your hardware setup');
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        email: form.email,
        password: form.password,
        name: form.name,
        // @ts-expect-error — extra fields passed through to after:signUp hook
        experienceLevel: form.experienceLevel,
        programmingBackground: form.programmingBackground,
        hardware: form.hardware,
        preferredLanguage: form.preferredLanguage,
      });

      if (result.error) {
        setError(result.error.message ?? 'Sign-up failed. Please try again.');
      } else {
        onSuccess?.();
      }
    } catch {
      setError('Sign-up failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480, margin: '0 auto' }}>
      <h2>Create your account</h2>

      {error && (
        <div style={{ color: 'red', marginBottom: 12, padding: '8px', background: '#fff0f0', borderRadius: 4 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="name">Full name *</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="email">Email address *</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="password">Password (min 8 characters) *</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={handleChange}
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="experienceLevel">Experience level *</label>
        <select
          id="experienceLevel"
          name="experienceLevel"
          required
          value={form.experienceLevel}
          onChange={handleChange}
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: 4 }}
        >
          {EXPERIENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} disabled={o.value === ''}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="programmingBackground">
          Programming background (optional, max 200 chars)
        </label>
        <textarea
          id="programmingBackground"
          name="programmingBackground"
          maxLength={200}
          value={form.programmingBackground}
          onChange={handleChange}
          rows={3}
          placeholder="e.g. Python basics, some ROS 2 experience"
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="hardware">Available hardware *</label>
        <select
          id="hardware"
          name="hardware"
          required
          value={form.hardware}
          onChange={handleChange}
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: 4 }}
        >
          {HARDWARE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} disabled={o.value === ''}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="preferredLanguage">Preferred language</label>
        <select
          id="preferredLanguage"
          name="preferredLanguage"
          value={form.preferredLanguage}
          onChange={handleChange}
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: 4 }}
        >
          {LANGUAGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{ padding: '10px 24px', cursor: loading ? 'wait' : 'pointer' }}
      >
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
