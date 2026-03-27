import React, { useEffect } from 'react';
import Layout from '@theme/Layout';
import { useSession } from '../components/Auth/AuthProvider';
import SignupForm from '../components/Auth/SignupForm';
import styles from '../components/Auth/AuthForm.module.css';

export default function SignupPage() {
  const session = useSession();

  // Read ?redirect= so we can return user to their destination after sign-up
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

  const handleSuccess = () => {
    window.location.href = redirectTo;
  };

  return (
    <Layout title="Sign Up" description="Create your Physical AI textbook account">
      <div className={styles.wrapper}>
        <SignupForm onSuccess={handleSuccess} />
      </div>
    </Layout>
  );
}
