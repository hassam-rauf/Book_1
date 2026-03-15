import { createAuthClient } from 'better-auth/react';
import React, { createContext, useContext } from 'react';

// Auth service URL — set DOCUSAURUS_AUTH_SERVICE_URL env var for production
const AUTH_SERVICE_URL =
  (typeof process !== 'undefined' && process.env.DOCUSAURUS_AUTH_SERVICE_URL) ||
  'http://localhost:3001';

export const authClient = createAuthClient({
  baseURL: AUTH_SERVICE_URL,
  fetchOptions: {
    credentials: 'include',
  },
});

export type AuthClient = typeof authClient;

const AuthContext = createContext<AuthClient>(authClient);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <AuthContext.Provider value={authClient}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthClient {
  return useContext(AuthContext);
}

// Re-export useSession for convenience
export const useSession = authClient.useSession;
