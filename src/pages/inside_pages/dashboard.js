import React, { useEffect } from 'react';
import { Container } from '@mui/material';
import Layout from './components/layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const Dashboard = () => {
  const { data: session, status } = useSession(); // Get session data and status
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page if no session and status is not loading
    if (status === 'loading') return; // Do not redirect if session is still loading
    if (!session) {
      router.push('/'); // Redirect to login if no session exists
    }
  }, [session, status, router]); // Watch for session and status changes

  // Show a loading state while session is being fetched
  if (status === 'loading') {
    return (
      <Container>
        <h1>Loading...</h1> {/* Or a spinner like <CircularProgress /> */}
      </Container>
    );
  }

  // If no session exists, do not render the page content
  if (!session) {
    return null; // Don't render anything if no session is found
  }

  return (
    <Layout>
      <Container>
        <h1>Welcome {session?.user?.username || 'User'}</h1>
        {/* You can display the tasks or any other data here */}
      </Container>
    </Layout>
  );
};

export default Dashboard;
