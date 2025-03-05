import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tooltip,
  Snackbar,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Chip,
  useMediaQuery,
  useTheme,
  createTheme,
  ThemeProvider,
  IconButton,
  Grid,
  Fade
} from '@mui/material';
import {
  ArrowUpward as AscIcon,
  ArrowDownward as DescIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Block as InactiveIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import Layout from '../components/layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/protectedRoute';

// Custom Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', // Soft blue
      light: '#64b5f6',
      dark: '#1976d2'
    },
    background: {
      default: '#f4f6f8', // Light grayish background
      paper: '#ffffff'
    },
    text: {
      primary: '#2c3e50', // Deep slate blue
      secondary: '#607d8b'
    },
    action: {
      hover: 'rgba(33, 150, 243, 0.08)' // Soft blue hover effect
    }
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 600,
      color: '#2c3e50'
    }
  },
  components: {
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.01)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 6px 15px rgba(33, 150, 243, 0.1)'
        }
      }
    }
  }
});

const DevicesPage = () => {
  const [devices, setDevices] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [sortByRegDate, setSortByRegDate] = useState(null);
  const [sortByActiveDate, setSortByActiveDate] = useState(null);

  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
    }
  }, [session, status, router]);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      setDevices(data);
    } catch (error) {
      console.error('Failed to fetch devices', error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const sortedDevices = [...devices].sort((a, b) => {
    if (sortByRegDate !== null) {
      return sortByRegDate
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortByActiveDate !== null) {
      return sortByActiveDate
        ? new Date(a.last_active) - new Date(b.last_active)
        : new Date(b.last_active) - new Date(a.last_active);
    }
    return 0;
  });

  const toggleSortByRegDate = () => {
    setSortByRegDate((prev) => (prev === null ? true : !prev));
    setSortByActiveDate(null);
  };

  const toggleSortByActiveDate = () => {
    setSortByActiveDate((prev) => (prev === null ? true : !prev));
    setSortByRegDate(null);
  };

  if (status === 'loading') {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Container>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <ProtectedRoute>
        <Layout>
          <Box sx={{ p: { xs: 1, sm: 3 } }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 3, 
                textAlign: { xs: 'center', sm: 'left' } 
              }}
            >
              Device Management
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={4} sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Total Devices
                    </Typography>
                    <Typography variant="h3" color="primary.dark">
                      {devices.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={4} sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Active Devices
                    </Typography>
                    <Typography variant="h3" color="success.main">
                      {devices.filter(d => d.status === 'active').length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper 
              sx={{ 
                p: 2, 
                my: 3, 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: 2, 
                alignItems: 'center' 
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  startIcon={<FilterIcon />}
                  onClick={toggleSortByRegDate}
                >
                  Reg. Date {sortByRegDate !== null && (sortByRegDate ? <AscIcon /> : <DescIcon />)}
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<FilterIcon />}
                  onClick={toggleSortByActiveDate}
                >
                  Last Active {sortByActiveDate !== null && (sortByActiveDate ? <AscIcon /> : <DescIcon />)}
                </Button>
              </Box>
            </Paper>

            <Fade in={true}>
              <TableContainer component={Paper} elevation={4}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Device ID</TableCell>
                      {!isMobile && <TableCell>Registration Date</TableCell>}
                      {!isMobile && <TableCell>Last Active</TableCell>}
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedDevices.map((device) => (
                      <TableRow key={device.device_id} hover>
                        <TableCell>
                          <Tooltip title="Click to copy">
                            <Box
                              component="span"
                              sx={{ 
                                cursor: 'pointer', 
                                '&:hover': { 
                                  textDecoration: 'underline',
                                  color: 'primary.main' 
                                } 
                              }}
                              onClick={() => {
                                navigator.clipboard.writeText(device.device_id);
                                setSnackbarOpen(true);
                              }}
                            >
                              {device.device_id}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        {!isMobile && <TableCell>{formatDate(device.created_at)}</TableCell>}
                        {!isMobile && <TableCell>{formatDate(device.last_active)}</TableCell>}
                        <TableCell>
                          <Chip
                            label={device.status}
                            color={device.status === 'active' ? 'success' : 'error'}
                            size="small"
                            icon={device.status === 'active' ? <ActiveIcon /> : <InactiveIcon />}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => console.log(`Delete ${device.device_id}`)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Fade>

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={2000}
              onClose={() => setSnackbarOpen(false)}
              message="Device ID copied to clipboard"
            />
          </Box>
        </Layout>
      </ProtectedRoute>
    </ThemeProvider>
  );
};

export default DevicesPage;
