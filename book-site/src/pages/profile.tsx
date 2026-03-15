import React, { useEffect } from 'react';
import Layout from '@theme/Layout';
import { useSession } from '../components/Auth/AuthProvider';
import ProfileForm from '../components/Auth/ProfileForm';

export default function ProfilePage() {
  const session = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!session.isPending && !session.data?.user) {
      window.location.href = '/login?redirect=/profile';
    }
  }, [session.isPending, session.data]);

  if (session.isPending) {
    return (
      <Layout title="Profile">
        <div style={{ padding: '40px 20px' }}>
          <p>Loading…</p>
        </div>
      </Layout>
    );
  }

  if (!session.data?.user) {
    return null; // redirect in progress
  }

  return (
    <Layout title="Your Profile" description="Manage your Physical AI textbook profile">
      <div style={{ padding: '40px 20px' }}>
        <ProfileForm />
      </div>
    </Layout>
  );
}
