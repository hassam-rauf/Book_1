import React from 'react';
import { authClient, useSession } from './AuthProvider';

/**
 * NavbarAuth — renders login/signup links when unauthenticated,
 * or username + Log Out button when authenticated.
 *
 * Usage: add to docusaurus.config.ts navbar.items:
 *   { type: 'custom-NavbarAuth', position: 'right' }
 * and register the swizzle component.
 *
 * Or import directly into a custom NavbarItem component.
 */
export default function NavbarAuth() {
  const session = useSession();
  const user = session.data?.user;

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  if (session.isPending) {
    return null; // Don't flash login links during session check
  }

  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 14 }}>{user.name || user.email}</span>
        <button
          onClick={handleSignOut}
          style={{
            padding: '4px 12px',
            fontSize: 14,
            cursor: 'pointer',
            border: '1px solid currentColor',
            borderRadius: 4,
            background: 'transparent',
          }}
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <a href="/login" style={{ fontSize: 14 }}>
        Log In
      </a>
      <a
        href="/signup"
        style={{
          fontSize: 14,
          padding: '4px 12px',
          borderRadius: 4,
          background: 'var(--ifm-color-primary)',
          color: '#fff',
          textDecoration: 'none',
        }}
      >
        Sign Up
      </a>
    </div>
  );
}
