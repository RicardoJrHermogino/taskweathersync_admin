import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import LogoutDialog from './Logout';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  CssBaseline,
  Container,
  SwipeableDrawer,
  Fade
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  AccountCircle as AccountIcon,
  Task as TaskIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import Link from 'next/link';

const DRAWER_WIDTH = {
  xs: '50%',
  sm: 240,
};

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);  // Separate state for mobile drawer
  const [desktopOpen, setDesktopOpen] = useState(true); // Separate state for desktop drawer
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const router = useRouter();


  if (!children) return null;

  // Update desktop drawer state when screen size changes
  useEffect(() => {
    if (!isMobile && !isTablet) {
      setDesktopOpen(true);
    }
  }, [isMobile, isTablet]);

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setLogoutDialogOpen(true);
  };

  const handleLogoutClose = () => {
    setLogoutDialogOpen(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Separate handlers for mobile and desktop
  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDesktopDrawerToggle = () => {
    setDesktopOpen(!desktopOpen);
  };

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, href: '/inside_pages/dashboard' },
    { text: 'Users', icon: <AccountIcon />, href: '/inside_pages/Users' },
    { text: 'Tasks', icon: <TaskIcon />, href: '/inside_pages/TaskList' },
  ];

  const DrawerContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end', // Changed to flex-end to only show close button
          px: [1, 2],
          py: [1.5, 2],
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        {isMobile && (
          <IconButton onClick={handleMobileDrawerToggle} edge="end">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List
        component="nav"
        sx={{
          px: [1, 2],
          py: [1, 1.5],
          flex: 1,
        }}
      >
        {navigationItems.map((item) => (
          <Link
            key={item.text}
            href={item.href}
            passHref
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <ListItem
              disablePadding
              sx={{
                mb: 0.5,
              }}
              onClick={isMobile ? handleMobileDrawerToggle : undefined}
            >
              <ListItemButton
                selected={router.pathname === item.href}
                sx={{
                  borderRadius: 1,
                  py: 1.5,
                  px: { xs: 1.5, sm: 2 },
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: { xs: 40, sm: 48 },
                    color: router.pathname === item.href ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: router.pathname === item.href ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider />
      <List
        component="nav"
        sx={{
          px: [1, 2],
          py: [1, 1.5],
        }}
      >
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogoutClick}
            sx={{
              borderRadius: 1,
              py: 1.5,
              px: { xs: 1.5, sm: 2 },
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: { xs: 40, sm: 48 } }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {children}
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${desktopOpen ? DRAWER_WIDTH.sm : 0}px)` },
          ml: { sm: desktopOpen ? DRAWER_WIDTH.sm : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleMobileDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: 'none' },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              display: 'block', // Changed to always show
            }}
          >
            TaskWeatherSync
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { sm: DRAWER_WIDTH.sm },
          flexShrink: { sm: 0 },
        }}
      >
        {isMobile ? (
          <SwipeableDrawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}  // Use mobile state
            onClose={handleMobileDrawerToggle}
            onOpen={() => setMobileOpen(true)}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH.xs,
                bgcolor: 'background.default',
              },
            }}
          >
            <DrawerContent />
          </SwipeableDrawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH.sm,
                bgcolor: 'background.default',
                height: '100vh',
                position: 'fixed',
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              },
            }}
            open={desktopOpen}  // Use desktop state
          >
            <DrawerContent />
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH.sm}px)` },
          minHeight: '100vh',
          pt: { xs: 7, sm: 8 },
          px: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 2, sm: 3 },
          bgcolor: 'grey.50',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 0 },
            height: '100%',
          }}
        >
          <Fade in={true} timeout={500}>
            {children}
          </Fade>
        </Container>
      </Box>

      <LogoutDialog
        open={logoutDialogOpen}
        onClose={handleLogoutClose}
        onConfirm={handleLogoutConfirm}
      />
    </Box>
  );
};

export default Layout;