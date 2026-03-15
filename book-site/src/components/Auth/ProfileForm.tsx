import React, { useEffect, useState } from 'react';

const BACKEND_URL =
  (typeof process !== 'undefined' && process.env.DOCUSAURUS_BACKEND_URL) ||
  'https://book-1-ygse.onrender.com';

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

const HARDWARE_OPTIONS = [
  { value: 'laptop-only', label: 'Laptop only (CPU)' },
  { value: 'gpu-workstation', label: 'GPU workstation' },
  { value: 'jetson-kit', label: 'NVIDIA Jetson kit' },
  { value: 'robot', label: 'Physical robot' },
] as const;

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'اردو (Urdu)' },
] as const;

interface Profile {
  user_id: string;
  experience_level: string;
  programming_background: string;
  hardware: string;
  preferred_language: string;
  updated_at: string;
}

export default function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    experience_level: 'beginner',
    programming_background: '',
    hardware: 'laptop-only',
    preferred_language: 'en',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const resp = await fetch(`${BACKEND_URL}/profile`, {
          credentials: 'include',
        });
        if (resp.status === 401) {
          window.location.href = '/login?redirect=/profile';
          return;
        }
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data: Profile = await resp.json();
        setProfile(data);
        setForm({
          experience_level: data.experience_level,
          programming_background: data.programming_background,
          hardware: data.hardware,
          preferred_language: data.preferred_language,
        });
      } catch (e) {
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const resp = await fetch(`${BACKEND_URL}/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (resp.status === 401) {
        window.location.href = '/login?redirect=/profile';
        return;
      }
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.detail ?? `HTTP ${resp.status}`);
      }

      const updated: Profile = await resp.json();
      setProfile(updated);
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading profile…</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480, margin: '0 auto' }}>
      <h2>Your Profile</h2>

      {profile && (
        <p style={{ fontSize: 12, color: 'gray' }}>
          Last updated: {new Date(profile.updated_at).toLocaleString()}
        </p>
      )}

      {error && (
        <div style={{ color: 'red', marginBottom: 12, padding: '8px', background: '#fff0f0', borderRadius: 4 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ color: 'green', marginBottom: 12, padding: '8px', background: '#f0fff0', borderRadius: 4 }}>
          Profile updated successfully.
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="experience_level">Experience level</label>
        <select
          id="experience_level"
          name="experience_level"
          value={form.experience_level}
          onChange={handleChange}
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: 4 }}
        >
          {EXPERIENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="programming_background">Programming background (max 200 chars)</label>
        <textarea
          id="programming_background"
          name="programming_background"
          maxLength={200}
          value={form.programming_background}
          onChange={handleChange}
          rows={3}
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="hardware">Available hardware</label>
        <select
          id="hardware"
          name="hardware"
          value={form.hardware}
          onChange={handleChange}
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: 4 }}
        >
          {HARDWARE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="preferred_language">Preferred language</label>
        <select
          id="preferred_language"
          name="preferred_language"
          value={form.preferred_language}
          onChange={handleChange}
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: 4 }}
        >
          {LANGUAGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={saving}
        style={{ padding: '10px 24px', cursor: saving ? 'wait' : 'pointer' }}
      >
        {saving ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
