import React, { useState, useContext } from 'react';
import { 
  Container, Paper, TextField, Button, Typography, Box, Divider,
  RadioGroup, FormControlLabel, Radio, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { handleGoogleLogin } from '../../services/auth';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [tempCredential, setTempCredential] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.role) {
      setError('Please select a role');
      return;
    }

    try {
      await register(formData);
      navigate('/');
    } catch (error) {
      setError(error.message || 'Registration failed');
      console.error('Registration error:', error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Store the credential first
      setTempCredential(credentialResponse.credential);
      // Open role dialog
      setOpenRoleDialog(true);
    } catch (error) {
      console.error('Google registration error:', error);
      setError('Google registration failed');
    }
  };

  const handleRoleSelect = async () => {
    try {
      console.log('Selected role:', formData.role); // Debug log
      const data = await handleGoogleLogin(tempCredential, formData.role, true);
      
      if (data && data.token) {
        // Store auth data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Force a complete page reload to update the application state
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Google registration error:', error);
      setError(error.message || 'Google registration failed');
    }
    setOpenRoleDialog(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Create Account
        </Typography>
        
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Full Name"
            name="name"
            autoFocus
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
          <RadioGroup
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            sx={{ mb: 2, width: '100%' }}
          >
            <FormControlLabel value="artist" control={<Radio />} label="Artist" />
            <FormControlLabel value="buyer" control={<Radio />} label="Buyer" />
          </RadioGroup>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Create Account
          </Button>
        </Box>

        <Divider sx={{ width: '100%', my: 2 }}>OR</Divider>

        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google registration failed')}
            useOneTap={false}
            cookiePolicy={'single_host_origin'}
            isSignedIn={false}
          />
        </Box>
        
        {/* Role Selection Dialog for Google Sign-up */}
        <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)}>
          <DialogTitle>Select Your Role</DialogTitle>
          <DialogContent>
            <RadioGroup
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <FormControlLabel value="artist" control={<Radio />} label="Artist" />
              <FormControlLabel value="buyer" control={<Radio />} label="Buyer" />
            </RadioGroup>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
            <Button onClick={handleRoleSelect} variant="contained" disabled={!formData.role}>
              Continue
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Register;