import React, { useState, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Badge,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Modal,
  Switch,
  FormControlLabel,
  Box as MuiBox
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Palette as PaletteIcon,
  CloudUpload as UploadIcon,
  Gavel as GavelIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const notificationTypes = [
  { key: 'bidAlerts', label: 'Bid Alerts' },
  { key: 'auctionReminders', label: 'Auction Reminders' },
  { key: 'artworkSold', label: 'Artwork Sold' },
  { key: 'payoutUpdates', label: 'Payout Updates' },
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('notificationPreferences');
    return saved ? JSON.parse(saved) : {
      bidAlerts: true,
      auctionReminders: true,
      artworkSold: true,
      payoutUpdates: true,
    };
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/');
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleToggle = (key) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('notificationPreferences', JSON.stringify(updated));
      return updated;
    });
  };

  const getNavItems = () => {
    const items = [
      { text: 'Home', icon: <HomeIcon />, path: '/' },
      { text: 'Artworks', icon: <PaletteIcon />, path: '/artworks' }
    ];

    if (isAuthenticated) {
      if (user?.role === 'artist') {
        items.push({ text: 'Upload Artwork', icon: <UploadIcon />, path: '/upload-artwork' });
      } else if (user?.role === 'buyer') {
        items.push({ text: 'My Bids', icon: <GavelIcon />, path: '/my-bids' });
      }
    }

    return items;
  };

  const localUnreadCount = notifications.filter(n => !n.isRead).length;

  const renderMobileDrawer = () => (
    <Drawer
      variant="temporary"
      anchor="left"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': { 
          width: 250,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default
        }
      }}
    >
      <Box sx={{ width: 250 }}>
        <List>
          {getNavItems().map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            eBidz
          </Link>
        </Typography>

        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getNavItems().map((item) => (
              <Button
                key={item.text}
                color="inherit"
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{ mx: 1 }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
        )}

        {isAuthenticated ? (
          <Box sx={{ display: 'flex' }}>
            <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit" onClick={handleProfileMenuOpen}>
              <PersonIcon />
            </IconButton>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>

      {renderMobileDrawer()}

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { navigate('/notifications'); handleMenuClose(); }}>
          View All Notifications
        </MenuItem>
        <MenuItem onClick={() => { setSettingsOpen(true); handleMenuClose(); }}>
          Notification Settings
        </MenuItem>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem onClick={handleMenuClose}>No new notifications</MenuItem>
        ) : (
          notifications.slice(0, 5).map((n) => (
            <MenuItem
              key={n._id}
              onClick={() => {
                markAsRead(n._id);
                handleMenuClose();
              }}
              selected={!n.isRead}
            >
              {n.message}
            </MenuItem>
          ))
        )}
        {notifications.length > 0 && <Divider />}
        {notifications.length > 0 && (
          <MenuItem onClick={() => { markAllAsRead(); handleMenuClose(); }}>
            Mark All as Read
          </MenuItem>
        )}
        {notifications.length > 0 && (
          <MenuItem onClick={() => { clearNotifications(); handleMenuClose(); }}>
            Clear All
          </MenuItem>
        )}
      </Menu>
      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        aria-labelledby="notification-settings-modal"
      >
        <MuiBox sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 350,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography id="notification-settings-modal" variant="h6" gutterBottom>
            Notification Preferences
          </Typography>
          {notificationTypes.map((type) => (
            <FormControlLabel
              key={type.key}
              control={
                <Switch
                  checked={preferences[type.key]}
                  onChange={() => handleToggle(type.key)}
                  color="primary"
                />
              }
              label={type.label}
              sx={{ display: 'block', mb: 1 }}
            />
          ))}
          <Button
            variant="contained"
            color="primary"
            onClick={() => setSettingsOpen(false)}
            sx={{ mt: 2, float: 'right' }}
          >
            Close
          </Button>
        </MuiBox>
      </Modal>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Navbar;