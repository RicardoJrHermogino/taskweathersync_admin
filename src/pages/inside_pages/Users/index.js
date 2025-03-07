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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  ArrowUpward as AscIcon,
  ArrowDownward as DescIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Block as InactiveIcon
} from '@mui/icons-material';
import Layout from '../components/layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/protectedRoute';

const DevicesPage = () => {
  const [devices, setDevices] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [sortByRegDate, setSortByRegDate] = useState(null); // null = no sort, true = asc, false = desc
  const [sortByActiveDate, setSortByActiveDate] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  // New state for delete confirmation dialog
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);

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

  // Opens the confirmation dialog and sets the device to delete
  const handleDeleteClick = (deviceId) => {
    setDeviceToDelete(deviceId);
    setConfirmDeleteOpen(true);
  };

  // Cancel delete operation
  const handleDeleteCancel = () => {
    setConfirmDeleteOpen(false);
    setDeviceToDelete(null);
  };

  // Confirm and execute delete operation
  const handleDeleteConfirm = async () => {
    if (deviceToDelete) {
      await deleteDevice(deviceToDelete);
      setConfirmDeleteOpen(false);
      setDeviceToDelete(null);
    }
  };

  const deleteDevice = async (deviceId) => {
    try {
      const res = await fetch('/api/devices', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device_id: deviceId }),
      });
      
      if (res.ok) {
        fetchDevices();
        setSnackbarMessage("Device deleted successfully");
        setSnackbarOpen(true);
      } else {
        console.error('Failed to delete device');
        setSnackbarMessage("Failed to delete device");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      setSnackbarMessage("Error deleting device");
      setSnackbarOpen(true);
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
    setSortByActiveDate(null); // Reset other sorting
  };

  const toggleSortByActiveDate = () => {
    setSortByActiveDate((prev) => (prev === null ? true : !prev));
    setSortByRegDate(null); // Reset other sorting
  };

  const copyDeviceId = (deviceId) => {
    navigator.clipboard.writeText(deviceId);
    setSnackbarMessage("Device ID copied to clipboard");
    setSnackbarOpen(true);
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

          {/* Sorting Buttons */}
          <Paper sx={{ p: 2, mb: 4, display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={toggleSortByRegDate}>
              Sort by Registration Date {sortByRegDate !== null && (sortByRegDate ? <AscIcon /> : <DescIcon />)}
            </Button>
            <Button variant="contained" onClick={toggleSortByActiveDate}>
              Sort by Last Active {sortByActiveDate !== null && (sortByActiveDate ? <AscIcon /> : <DescIcon />)}
            </Button>
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
                {sortedDevices.map((device) => (
                  <TableRow key={device.device_id} hover>
                    <TableCell>
                      <Tooltip title="Click to copy" placement="top">
                        <Box
                          component="span"
                          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                          onClick={() => copyDeviceId(device.device_id)}
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
                        onClick={() => handleDeleteClick(device.device_id)}
                      >
                        Delete 
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={confirmDeleteOpen}
            onClose={handleDeleteCancel}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Confirm Device Deletion"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete this device? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel} color="primary">
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={2000}
            onClose={() => setSnackbarOpen(false)}
            message={snackbarMessage}
          />
        </Box>
      </Layout>
    </ProtectedRoute>
  );
};

export default DevicesPage;
