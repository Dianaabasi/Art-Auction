import React, { useEffect, useState } from 'react';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Select, MenuItem, FormControl, InputLabel, Box, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Chip
} from '@mui/material';
import { Visibility, Edit, Block, CheckCircle, Refresh } from '@mui/icons-material';
import { getAllUsers, updateUserRole, banUser } from '../../services/api';

const roleOptions = ['admin', 'artist', 'buyer'];

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const data = await getAllUsers(params);
      setUsers(data);
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId + '-role');
    await updateUserRole(userId, newRole);
    await fetchUsers();
    setActionLoading('');
  };

  const handleBanToggle = async (userId, banned) => {
    setActionLoading(userId + '-ban');
    await banUser(userId, !banned);
    await fetchUsers();
    setActionLoading('');
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedUser(null);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Manage Users</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Search by name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
        />
        <FormControl size="small">
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            label="Role"
            onChange={e => setRoleFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            {roleOptions.map(role => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={fetchUsers}>Refresh</Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      color={user.role === 'admin' ? 'error' : user.role === 'artist' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.banned ? 'Banned' : 'Active'} 
                      color={user.banned ? 'error' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(user)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <Select
                          value={user.role}
                          size="small"
                          disabled={actionLoading === user._id + '-role'}
                          onChange={e => handleRoleChange(user._id, e.target.value)}
                        >
                          {roleOptions.map(role => (
                            <MenuItem key={role} value={role}>{role}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <Tooltip title={user.banned ? 'Unban User' : 'Ban User'}>
                        <IconButton
                          color={user.banned ? 'success' : 'error'}
                          size="small"
                          disabled={actionLoading === user._id + '-ban'}
                          onClick={() => handleBanToggle(user._id, user.banned)}
                        >
                          {user.banned ? <CheckCircle /> : <Block />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">{selectedUser.name}</Typography>
              <Typography>Email: {selectedUser.email}</Typography>
              <Typography>Role: {selectedUser.role}</Typography>
              <Typography>Status: {selectedUser.banned ? 'Banned' : 'Active'}</Typography>
              <Typography>Email Verified: {selectedUser.isEmailVerified ? 'Yes' : 'No'}</Typography>
              <Typography>Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</Typography>
              {selectedUser.bio && (
                <Typography>Bio: {selectedUser.bio}</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UsersAdmin; 