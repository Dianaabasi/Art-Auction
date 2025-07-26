import React, { useState, useContext } from 'react';
import { Box, Drawer, List, ListItem, ListItemText, Typography, Toolbar, AppBar, CssBaseline, Button } from '@mui/material';
import UsersAdmin from './UsersAdmin';
import ArtworksAdmin from './ArtworksAdmin';
import AuctionsAdmin from './AuctionsAdmin';
import AnalyticsAdmin from './AnalyticsAdmin';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const sections = [
  { label: 'Users', component: <UsersAdmin /> },
  { label: 'Artworks', component: <ArtworksAdmin /> },
  { label: 'Auctions', component: <AuctionsAdmin /> },
  { label: 'Analytics', component: <AnalyticsAdmin /> },
];

const AdminDashboard = () => {
  const [selectedSection, setSelectedSection] = useState(0);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flex: 1, pt: 8 }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <List sx={{ flexGrow: 1 }}>
              {sections.map((section, idx) => (
                <ListItem
                  button
                  key={section.label}
                  selected={selectedSection === idx}
                  onClick={() => setSelectedSection(idx)}
                  sx={selectedSection === idx ? {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemText-primary': { color: 'primary.contrastText' },
                    '&:hover': { bgcolor: 'primary.main' },
                  } : {}}
                >
                  <ListItemText primary={section.label} />
                </ListItem>
              ))}
            </List>
            <Button
              variant="outlined"
              color="error"
              sx={{ m: 2 }}
              onClick={() => {
                logout();
                navigate('/admin');
              }}
            >
              Logout
            </Button>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
          <Toolbar />
          {sections[selectedSection].component}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 