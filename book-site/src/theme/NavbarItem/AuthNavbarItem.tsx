import React from 'react';
import { authClient } from '@site/src/components/Auth/AuthProvider';

/**
 * Custom Docusaurus navbar item — type: 'custom-auth'
 * Desktop + hamburger mobile menu aware.
 *
 * Logged out → Log In | Sign Up links
 * Logged in  → 👤 Name  Sign Out button
 */
export default function AuthNavbarItem({ mobile }: { mobile?: boolean }) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  if (isPending) return null;

  const wrapStyle: React.CSSProperties = mobile
    ? { display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 16px' }
    : { display: 'flex', alignItems: 'center', gap: 8 };

  const linkStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
    padding: '4px 10px',
    borderRadius: 6,
    textDecoration: 'none',
    color: 'var(--ifm-navbar-link-color)',
    whiteSpace: 'nowrap',
  };

  const btnStyle: React.CSSProperties = {
    ...linkStyle,
    background: 'none',
    border: '1px solid var(--ifm-color-primary)',
    color: 'var(--ifm-color-primary)',
    cursor: 'pointer',
  };

  if (user) {
    return (
      <div style={wrapStyle}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ifm-navbar-link-color)', whiteSpace: 'nowrap' }}>
          👤 {user.name}
        </span>
        <button style={btnStyle} onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <a href="/login" style={linkStyle}>Log In</a>
      <a
        href="/signup"
        style={{
          ...linkStyle,
          background: 'var(--ifm-color-primary)',
          color: '#fff',
        }}
      >
        Sign Up
      </a>
    </div>
  );
}
