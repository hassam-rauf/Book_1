import React from 'react';
import { authClient } from './AuthProvider';

interface AuthGateProps {
  to: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Renders a <button> styled with className.
 * No href = no 404 flash from Docusaurus router.
 * - Logged in  → navigate to `to`
 * - Logged out → /login?redirect=<to>
 */
export default function AuthGate({ to, className, children }: AuthGateProps) {
  const { data: session, isPending } = authClient.useSession();

  const handleClick = () => {
    if (isPending) return;
    if (session?.user) {
      window.location.href = to;
    } else {
      window.location.href = `/login?redirect=${encodeURIComponent(to)}`;
    }
  };

  return (
    <button type="button" className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
