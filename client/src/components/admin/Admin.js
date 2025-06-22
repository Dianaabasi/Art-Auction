import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Button } from '@mui/material';
import { getAdminStats, getUsers, getAuctions } from '../../services/api';

const Admin = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsData, usersData, auctionsData] = await Promise.all([
        getAdminStats(),
        getUsers(),
        getAuctions()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setAuctions(auctionsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper style={{ padding: 20 }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h4">{stats.totalUsers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper style={{ padding: 20 }}>
            <Typography variant="h6">Active Auctions</Typography>
            <Typography variant="h4">{stats.activeAuctions}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper style={{ padding: 20 }}>
            <Typography variant="h6">Total Revenue</Typography>
            <Typography variant="h4">${stats.totalRevenue}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Admin;