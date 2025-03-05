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
  Block as BlockIcon,
  CheckCircle as ActiveIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Layout from '../components/layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/protectedRoute';

const UsersPage = () => {
  const [registrationStartDate, setRegistrationStartDate] = useState(null);
  const [registrationEndDate, setRegistrationEndDate] = useState(null);
  const [lastActiveStartDate, setLastActiveStartDate] = useState(null);
  const [lastActiveEndDate, setLastActiveEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
    }
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  useEffect(() => {
    if (status !== 'loading' && session) {
      fetchUsers();
    }
  }, [session, status]);

  const handleDeleteUser = async (user_id) => {
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id }),
      });

      if (res.ok) {
        fetchUsers();
        setSnackbarMessage('User deleted successfully');
        setSnackbarOpen(true);
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user', error);
    }
  };

  const handleBlockUser = async (user_id, current_status) => {
    try {
      const res = await fetch('/api/users/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id, 
          status: current_status === 'active' ? 'blocked' : 'active' 
        }),
      });

      if (res.ok) {
        fetchUsers();
        setSnackbarMessage(
          current_status === 'active' 
            ? 'User blocked successfully' 
            : 'User unblocked successfully'
        );
        setSnackbarOpen(true);
      } else {
        alert('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status', error);
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

  const formatSearchDate = (dateString) => {
    const [month, day, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const resetFilters = () => {
    setRegistrationStartDate(null);
    setRegistrationEndDate(null);
    setLastActiveStartDate(null);
    setLastActiveEndDate(null);
    setSearchTerm('');
  };

  const filteredUsers = users
    .filter(user => {
      // Registration date filter
      const userRegistrationDate = new Date(user.created_at);
      const registrationDateInRange = 
        (!registrationStartDate || userRegistrationDate >= registrationStartDate) &&
        (!registrationEndDate || userRegistrationDate <= registrationEndDate);

      // Last active date filter
      const userLastActiveDate = new Date(user.last_active);
      const lastActiveDateInRange = 
        (!lastActiveStartDate || userLastActiveDate >= lastActiveStartDate) &&
        (!lastActiveEndDate || userLastActiveDate <= lastActiveEndDate);

      // Search term filter (for date)
      let searchDateMatch = true;
      if (searchTerm) {
        try {
          const searchDate = formatSearchDate(searchTerm);
          const formattedUserDate = userRegistrationDate.toISOString().split('T')[0];
          searchDateMatch = formattedUserDate === searchDate;
        } catch (error) {
          searchDateMatch = false;
        }
      }

      return registrationDateInRange && 
             lastActiveDateInRange && 
             searchDateMatch;
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
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage registered users and their accounts
            </Typography>
          </Box>
        </Box>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Registered Users
            </Typography>
            <Typography variant="h3" component="div">
              {users.length}
            </Typography>
          </CardContent>
        </Card>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Paper sx={{ p: 2, mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
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
              </Grid>
              <Grid item xs={12} md={3}>
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
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="Last Active Start Date"
                    value={lastActiveStartDate}
                    onChange={(newValue) => setLastActiveStartDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                  <DatePicker
                    label="Last Active End Date"
                    value={lastActiveEndDate}
                    onChange={(newValue) => setLastActiveEndDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
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
                <TableCell>User ID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Registration Date</TableCell>
                <TableCell>Last Active</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.user_id} hover>
                  <TableCell>
                    <Tooltip title="Click to copy" placement="top">
                      <Box
                        component="span"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText(user.user_id);
                          setSnackbarMessage('User ID copied to clipboard');
                          setSnackbarOpen(true);
                        }}
                      >
                        {user.user_id}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>{formatDate(user.last_active)}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === 'active' ? 'success' : 'error'}
                      size="small"
                      icon={user.status === 'active' ? <ActiveIcon /> : <BlockIcon />}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button
                        color={user.status === 'active' ? 'error' : 'success'}
                        size="small"
                        startIcon={user.status === 'active' ? <BlockIcon /> : <ActiveIcon />}
                        onClick={() => handleBlockUser(user.user_id, user.status)}
                      >
                        {user.status === 'active' ? 'Block' : 'Unblock'}
                      </Button>
                      <Button
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteUser(user.user_id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </Layout>
    </ProtectedRoute>
  );
};

export default UsersPage;
