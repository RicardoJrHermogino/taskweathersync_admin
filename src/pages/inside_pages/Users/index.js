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
import Layout from '../components/layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/protectedRoute';

const DevicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [devices, setDevices] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [registrationDate, setRegistrationDate] = useState('');
  const [activeDate, setActiveDate] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();

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
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const filteredDevices = devices.filter((device) => {
    const deviceRegDate = formatDate(device.created_at);
    const deviceActiveDate = formatDate(device.last_active);

    const matchesRegistration = registrationDate ? deviceRegDate === registrationDate : true;
    const matchesActive = activeDate ? deviceActiveDate === activeDate : true;

    return matchesRegistration && matchesActive;
  });

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
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Device Management
          </Typography>

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

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 4, display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              type="date"
              label="Filter by Registration Date"
              InputLabelProps={{ shrink: true }}
              value={registrationDate}
              onChange={(e) => setRegistrationDate(e.target.value)}
            />
            <TextField
              fullWidth
              type="date"
              label="Filter by Last Active Date"
              InputLabelProps={{ shrink: true }}
              value={activeDate}
              onChange={(e) => setActiveDate(e.target.value)}
            />
          </Paper>

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
                          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
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
                        onClick={() => console.log(`Delete ${device.device_id}`)}
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
