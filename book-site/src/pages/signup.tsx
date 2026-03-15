import React, { useEffect } from 'react';
import Layout from '@theme/Layout';
import { useSession } from '../components/Auth/AuthProvider';
import SignupForm from '../components/Auth/SignupForm';

export default function SignupPage() {
  const session = useSession();

  // If already logged in, redirect to home
  useEffect(() => {
    if (session.data?.user) {
      window.location.href = '/';
    }
  }, [session.data]);

  const handleSuccess = () => {
    window.location.href = '/';
  };

  return (
    <Layout title="Sign Up" description="Create your Physical AI textbook account">
      <div style={{ padding: '40px 20px' }}>
        <SignupForm onSuccess={handleSuccess} />
      </div>
    </Layout>
  );
}
