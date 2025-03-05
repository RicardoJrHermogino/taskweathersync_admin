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
  TextField,
  InputAdornment,
  Tooltip,
  Snackbar,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Chip,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Block as InactiveIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Layout from '../components/layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/protectedRoute';

const DevicesPage = () => {
  const [registrationStartDate, setRegistrationStartDate] = useState(null);
  const [registrationEndDate, setRegistrationEndDate] = useState(null);
  const [activeStartDate, setActiveStartDate] = useState(null);
  const [activeEndDate, setActiveEndDate] = useState(null);
  const [devices, setDevices] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
    }
  }, [session, status, router]);

  const updateDeviceStatuses = async () => {
    try {
      const res = await fetch('/api/devices/update_status', {
        method: 'POST',
      });

      if (!res.ok) {
        console.error('Failed to update device statuses');
      }
    } catch (error) {
      console.error('Error updating device statuses', error);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
      return;
    }

    const initializeDevicePage = async () => {
      await updateDeviceStatuses();
      await fetchDevices();
    };

    initializeDevicePage();
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

  const handleDeleteDevice = async (device_id) => {
    try {
      const res = await fetch('/api/devices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id }),
      });

      if (res.ok) {
        fetchDevices();
        setSnackbarOpen(true);
      } else {
        alert('Failed to delete device');
      }
    } catch (error) {
      console.error('Error deleting device', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const filteredDevices = devices
    .filter(device => {
      const deviceRegistrationDate = new Date(device.created_at);
      const deviceActiveDate = new Date(device.last_active);

      // Registration date filter
      const registrationDateInRange = 
        (!registrationStartDate || deviceRegistrationDate >= registrationStartDate) &&
        (!registrationEndDate || deviceRegistrationDate <= registrationEndDate);

      // Active date filter
      const activeDateInRange = 
        (!activeStartDate || deviceActiveDate >= activeStartDate) &&
        (!activeEndDate || deviceActiveDate <= activeEndDate);

      return registrationDateInRange && activeDateInRange;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const resetFilters = () => {
    setRegistrationStartDate(null);
    setRegistrationEndDate(null);
    setActiveStartDate(null);
    setActiveEndDate(null);
  };

  if (status === 'loading') {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <ProtectedRoute>
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Device Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage registered devices and their IDs
            </Typography>
          </Box>
        </Box>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Registered Devices
            </Typography>
            <Typography variant="h3" component="div">
              {devices.length}
            </Typography>
          </CardContent>
        </Card>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Paper sx={{ p: 2, mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="Registration Start Date"
                    value={registrationStartDate}
                    onChange={(newValue) => setRegistrationStartDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                  <DatePicker
                    label="Registration End Date"
                    value={registrationEndDate}
                    onChange={(newValue) => setRegistrationEndDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="Active Start Date"
                    value={activeStartDate}
                    onChange={(newValue) => setActiveStartDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                  <DatePicker
                    label="Active End Date"
                    value={activeEndDate}
                    onChange={(newValue) => setActiveEndDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={resetFilters}
                  fullWidth
                >
                  Reset Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </LocalizationProvider>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Device ID</TableCell>
                <TableCell>Registration Date</TableCell>
                <TableCell>Last Active</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDevices.map((device) => (
                <TableRow key={device.device_id} hover>
                  <TableCell>
                    <Tooltip title="Click to copy" placement="top">
                      <Box
                        component="span"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
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
                  <TableCell>{formatDate(device.created_at)}</TableCell>
                  <TableCell>{formatDate(device.last_active)}</TableCell>

                  <TableCell>
                    <Chip
                      label={device.status}
                      color={device.status === 'active' ? 'success' : 'error'}
                      size="small"
                      icon={device.status === 'active' ? <ActiveIcon /> : <InactiveIcon />}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteDevice(device.device_id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={() => setSnackbarOpen(false)}
          message="Device ID copied to clipboard"
        />
      </Box>
    </Layout>
    </ProtectedRoute>
  );
};

export default DevicesPage;
