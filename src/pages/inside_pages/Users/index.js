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
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Menu,
  MenuItem,
  InputAdornment,
  Tooltip,
  Snackbar,
  CircularProgress,
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import Layout from '../components/layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // Add loading state for redirect
  const { data: session, status } = useSession(); // Get session data and status
  const router = useRouter();

  useEffect(() => {
    // Only redirect to login page if session is not found, but not during loading state
    if (status === 'loading') return; // Don't redirect during loading state

    if (!session) {
      setIsRedirecting(true); // Set the redirect state
      router.push('/'); // Redirect to login if no session exists
    }
  }, [session, status, router]); // Watch for session and status changes

  // Show a loading state while session is being fetched
  if (status === 'loading' || isRedirecting) {
    return (
      <Container>
        <CircularProgress /> {/* Spinner during loading state */}
      </Container>
    );
  }

  // If no session exists, do not render the page content
  if (!session) {
    return null; // Don't render anything if no session is found
  }

  // Sample user data structured according to the provided format
  const users = [
    {
      device_id: "06e4e386-c6ff-42a4-9727-2933c9aac2d4",
      created_at: "2024-12-18 11:40:42"
    },
    {
      device_id: "07bd82e0-63fa-4202-8b0f-e7df60e646622",
      created_at: "2025-01-14 22:16:08"
    },
    // Add more users as needed
  ];

  const handleOpenMenu = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleCopyDeviceId = (deviceId) => {
    navigator.clipboard.writeText(deviceId);
    setSnackbarOpen(true);
    handleCloseMenu();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Device Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage registered devices and their IDs
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ height: 'fit-content' }}
          >
            Add New Device
          </Button>
        </Box>

        {/* Stats Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Registered Devices
            </Typography>
            <Typography variant="h3" component="div">
              {users.length}
            </Typography>
          </CardContent>
        </Card>

        {/* Search Section */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search device IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: { sm: '100%', md: '400px' } }}
          />
        </Paper>

        {/* Devices Table */}
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
              {users.map((user) => (
                <TableRow key={user.device_id} hover>
                  <TableCell>
                    <Tooltip title="Click to copy" placement="top">
                      <Box
                        component="span"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                        onClick={() => handleCopyDeviceId(user.device_id)}
                      >
                        {user.device_id}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(event) => handleOpenMenu(event, user)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => handleCopyDeviceId(selectedUser?.device_id)}>
            <CopyIcon fontSize="small" sx={{ mr: 1 }} />
            Copy ID
          </MenuItem>
          <MenuItem onClick={handleCloseMenu}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleCloseMenu} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Add Device Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Device</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Device ID"
                variant="outlined"
                placeholder="Enter device ID or generate automatically"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setOpenDialog(false)}>
              Add Device
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for copy confirmation */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={() => setSnackbarOpen(false)}
          message="Device ID copied to clipboard"
        />
      </Box>
    </Layout>
  );
};

export default UsersPage;
