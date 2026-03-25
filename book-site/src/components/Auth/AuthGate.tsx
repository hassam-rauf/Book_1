import React from 'react';
import { authClient } from './AuthProvider';

interface AuthGateProps {
  to: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Drop-in replacement for Link/anchor on gated CTAs.
 * - Logged in  → navigate directly to `to`
 * - Logged out → /login?redirect=<to>
 */
export default function AuthGate({ to, className, children }: AuthGateProps) {
  const { data: session, isPending } = authClient.useSession();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isPending) return; // wait for session check
    if (session?.user) {
      window.location.href = to;
    } else {
      window.location.href = `/login?redirect=${encodeURIComponent(to)}`;
    }
  };

  return (
    <a href={to} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
