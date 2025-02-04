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
  
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
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

  useEffect(() => {
    if (status === 'loading') return; // Wait until session data is fetched
    if (!session) {
      router.push('/'); // Redirect if not logged in
    }
  }, [session, status, router]);

  // Fetch devices from the API
  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      setDevices(data);  // Set devices to state
    } catch (error) {
      console.error('Failed to fetch devices', error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Handle device deletion
  const handleDeleteDevice = async (device_id) => {
    try {
      const res = await fetch('/api/devices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id }),
      });

      if (res.ok) {
        fetchDevices(); // Refresh devices list after deletion
        setSnackbarOpen(true); // Show confirmation snackbar
      } else {
        alert('Failed to delete device');
      }
    } catch (error) {
      console.error('Error deleting device', error);
    }
  };

  // Show date in a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format the input date (MM/DD/YYYY) to YYYY-MM-DD
  const formatSearchDate = (dateString) => {
    const [month, day, year] = dateString.split('/'); // Split the input by "/"
    return `${year}-${month}-${day}`; // Return in YYYY-MM-DD format
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter devices by registration date (compare day/month/year)
  const filteredDevices = devices.filter(device => {
    if (!searchTerm) return true; // Return all devices if no search term

    const searchDate = formatSearchDate(searchTerm); // Format the input date
    const deviceDate = new Date(device.created_at);
    const formattedDeviceDate = deviceDate.toISOString().split('T')[0]; // Format device date to YYYY-MM-DD

    return formattedDeviceDate === searchDate; // Match formatted date
  });

  if (status === 'loading') {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (!session) {
    return null; // If no session, return nothing
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
            placeholder="Search by registration date (MM/DD/YYYY)"
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Device ID</TableCell>
                <TableCell>Registration Date</TableCell>
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

        {/* Snackbar for copy confirmation */}
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
