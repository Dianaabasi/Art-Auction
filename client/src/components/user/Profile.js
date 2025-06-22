import React, { useState, useContext, useEffect } from 'react';
import { 
  Container, Paper, Typography, Grid, TextField, Button, Box, 
  Avatar, IconButton, Snackbar, Alert, Divider
} from '@mui/material';
import { PhotoCamera, Logout as LogoutIcon } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../../services/api';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    oldPassword: '',
    newPassword: '',
    profilePhoto: null
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Initialize form data with user context data first
        setFormData(prevData => ({
          ...prevData,
          name: user?.name || '',
          email: user?.email || '',
          bio: user?.bio || ''
        }));

        // Only attempt to fetch additional profile data if user exists
        if (user) {
          const data = await getProfile();
          setFormData(prevData => ({
            ...prevData,
            bio: data.bio || prevData.bio,
            profilePhoto: data.profilePhoto || prevData.profilePhoto
          }));
          setPreviewUrl(data.profilePhoto || (user?.googleId ? user.profilePhoto : ''));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Don't set error if we at least have basic user data
        if (!user) {
          setError('Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePhoto: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('bio', formData.bio);
      if (formData.oldPassword && formData.newPassword) {
        formDataToSend.append('oldPassword', formData.oldPassword);
        formDataToSend.append('newPassword', formData.newPassword);
      }
      if (formData.profilePhoto instanceof File) {
        formDataToSend.append('profilePhoto', formData.profilePhoto);
      }

      await updateProfile(formDataToSend);
      setSuccess(true);
      setFormData({ ...formData, oldPassword: '', newPassword: '' });
    } catch (error) {
      setError('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Account Setting
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={previewUrl}
              sx={{ width: 120, height: 120 }}
            />
            <input
              accept="image/*"
              type="file"
              id="profile-photo"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="profile-photo">
              <IconButton
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'white'
                }}
              >
                <PhotoCamera />
              </IconButton>
            </label>
          </Box>
        </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Role"
                name="role"
                value={user?.role === 'artist' ? 'Artist' : 'Buyer'}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                multiline
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </Grid>
            {!user?.googleId && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Old Password"
                    name="oldPassword"
                    type="password"
                    value={formData.oldPassword}
                    onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Save Changes
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">Profile updated successfully!</Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;