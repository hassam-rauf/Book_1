import React, { useState } from 'react';
import { authClient } from './AuthProvider';
import styles from './AuthForm.module.css';

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
    <div className={styles.card}>
      <h2 className={styles.title}>Create your account</h2>
      <p className={styles.subtitle}>Join to get personalised content and Urdu support</p>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>Full name *</label>
          <input
            id="name" name="name" type="text" required
            autoComplete="name"
            placeholder="Your full name"
            value={form.name} onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email address *</label>
          <input
            id="email" name="email" type="email" required
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email} onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Password (min 8 characters) *</label>
          <input
            id="password" name="password" type="password" required minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.password} onChange={handleChange}
            className={styles.input}
          />
        </div>

        <hr className={styles.divider} />

        <div className={styles.field}>
          <label htmlFor="experienceLevel" className={styles.label}>Experience level *</label>
          <select
            id="experienceLevel" name="experienceLevel" required
            value={form.experienceLevel} onChange={handleChange}
            className={styles.select}
          >
            {EXPERIENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} disabled={o.value === ''}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="programmingBackground" className={styles.label}>
            Programming background <span style={{ fontWeight: 400, color: 'var(--ifm-color-emphasis-500)' }}>(optional)</span>
          </label>
          <textarea
            id="programmingBackground" name="programmingBackground"
            maxLength={200} rows={3}
            placeholder="e.g. Python basics, some ROS 2 experience"
            value={form.programmingBackground} onChange={handleChange}
            className={styles.textarea}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="hardware" className={styles.label}>Available hardware *</label>
          <select
            id="hardware" name="hardware" required
            value={form.hardware} onChange={handleChange}
            className={styles.select}
          >
            {HARDWARE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} disabled={o.value === ''}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="preferredLanguage" className={styles.label}>Preferred language</label>
          <select
            id="preferredLanguage" name="preferredLanguage"
            value={form.preferredLanguage} onChange={handleChange}
            className={styles.select}
          >
            {LANGUAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className={styles.footer}>
        Already have an account? <a href="/login">Sign in</a>
      </p>
    </div>
  );
}
