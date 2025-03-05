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
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Block as InactiveIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/lab'; // Import MUI Date Picker
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Layout from '../components/layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/protectedRoute';

const DevicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [devices, setDevices] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Date filter states
  const [registrationDate, setRegistrationDate] = useState(null);
  const [lastActiveDate, setLastActiveDate] = useState(null);

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredDevices = devices
    .filter((device) => {
      if (!searchTerm) return true;
      return device.device_id.includes(searchTerm);
    })
    .filter((device) => {
      if (!registrationDate) return true;
      const deviceDate = new Date(device.created_at).toISOString().split('T')[0];
      return deviceDate === registrationDate.toISOString().split('T')[0];
    })
    .filter((device) => {
      if (!lastActiveDate) return true;
      const deviceDate = new Date(device.last_active).toISOString().split('T')[0];
      return deviceDate === lastActiveDate.toISOString().split('T')[0];
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

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

          <Paper sx={{ p: 2, mb: 4 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by Device ID"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Paper>

          {/* Date Filters */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <DatePicker
                label="Filter by Registration Date"
                value={registrationDate}
                onChange={(newValue) => setRegistrationDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DatePicker
                label="Filter by Last Active Date"
                value={lastActiveDate}
                onChange={(newValue) => setLastActiveDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>
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
                          onClick={() => navigator.clipboard.writeText(device.device_id)}
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
