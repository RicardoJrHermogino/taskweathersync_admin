import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Card,
  Grid,
  Button,
  useTheme,
} from '@mui/material';
import {
  Devices as DevicesIcon,
  Task as TaskIcon,
  Speed as SpeedIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import Layout from './components/layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import ProtectedRoute from './components/protectedRoute';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const [devicesCount, setDevicesCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);

  // Custom colors for minimalist theme
  const colors = {
    primary: '#647CBF',    // Soft blue
    secondary: '#8E9FBF',  // Muted blue-gray
    success: '#82A0AA',    // Soft teal
    text: '#2D3748',       // Dark gray for text
    subtext: '#718096',    // Medium gray for secondary text
    background: '#F7FAFC',  // Very light gray background
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [devicesRes, tasksRes] = await Promise.all([
          fetch('/api/devices'),
          fetch('/api/tasks'),
        ]);
        const devicesData = await devicesRes.json();
        const tasksData = await tasksRes.json();
        setDevicesCount(devicesData.length);
        setTasksCount(tasksData.length);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };
    fetchCounts();
  }, []);

  if (status === 'loading') {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ backgroundColor: colors.background }}
      >
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  if (!session) return null;

  const StatCard = ({ icon: Icon, title, value, subtitle, color, actionLabel, onAction }) => (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: 'rgba(149, 157, 165, 0.1) 0px 8px 24px',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          right: -10,
          opacity: 0.03,
          transform: 'rotate(25deg)',
        }}
      >
        <Icon sx={{ fontSize: 140, color }} />
      </Box>
      <Box sx={{ p: 3.5, position: 'relative' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Icon sx={{ color, mr: 1.5, fontSize: 22 }} />
          <Typography
            variant="h6"
            sx={{
              color: colors.text,
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            {title}
          </Typography>
        </Box>
        <Typography
          variant="h3"
          component="div"
          sx={{
            mb: 1,
            fontWeight: 600,
            fontSize: '2.5rem',
            color: colors.text,
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mb: 3,
            color: colors.subtext,
            fontSize: '0.875rem',
          }}
        >
          {subtitle}
        </Typography>
        {actionLabel && (
          <Button
            variant="text"
            endIcon={<ArrowForwardIcon />}
            onClick={onAction}
            sx={{
              textTransform: 'none',
              color: color,
              fontSize: '0.875rem',
              fontWeight: 500,
              p: 0,
              '&:hover': {
                backgroundColor: 'transparent',
                opacity: 0.8,
              },
            }}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
    </Card>
  );

  return (
    <ProtectedRoute>
    <Layout>
      <Box sx={{ backgroundColor: colors.background, minHeight: '100vh' }}>
        <Container maxWidth="xl" sx={{ pt: 5, pb: 8 }}>
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h3"
              gutterBottom
              sx={{
                fontWeight: 600,
                fontSize: '2rem',
                color: colors.text,
                mb: 1,
              }}
            >
              Welcome back, {session?.user?.username || 'User'}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: colors.subtext,
                fontSize: '1rem',
              }}
            >
              Here's what's happening with your devices and tasks today
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <StatCard
                icon={DevicesIcon}
                title="Total Devices"
                value={devicesCount}
                subtitle="Registered devices in your network"
                color={colors.primary}
                actionLabel="View All Devices"
                onAction={() => router.push('/inside_pages/Users')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                icon={TaskIcon}
                title="Active Tasks"
                value={tasksCount}
                subtitle="Tasks currently in progress"
                color={colors.secondary}
                actionLabel="Manage Tasks"
                onAction={() => router.push('/inside_pages/TaskList')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                icon={SpeedIcon}
                title="System Status"
                value="Optimal"
                subtitle="All systems running smoothly"
                color={colors.success}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Layout>
    </ProtectedRoute>
    
  );
};

export default Dashboard;