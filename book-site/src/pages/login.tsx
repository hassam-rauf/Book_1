import React, { useEffect } from 'react';
import Layout from '@theme/Layout';
import { useSession } from '../components/Auth/AuthProvider';
import LoginForm from '../components/Auth/LoginForm';

export default function LoginPage() {
  const session = useSession();

  // Read ?redirect= query param for post-login destination
  const redirectTo =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('redirect') ?? '/'
      : '/';

  // If already logged in, redirect immediately
  useEffect(() => {
    if (session.data?.user) {
      window.location.href = redirectTo;
    }
  }, [session.data, redirectTo]);

  return (
    <Layout title="Log In" description="Sign in to your Physical AI textbook account">
      <div style={{ padding: '40px 20px' }}>
        <LoginForm redirectTo={redirectTo} />
      </div>
    </Layout>
  );
}
