import React, { useState, useContext } from 'react';
import { 
  Container, Paper, TextField, Button, Typography, Box, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio 
} from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { handleGoogleLogin } from '../../services/auth';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [tempCredential, setTempCredential] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(formData);
      navigate('/');
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Try to login directly first
      const data = await handleGoogleLogin(credentialResponse.credential);
      if (data.token) {
        navigate('/');
        window.location.reload();
        return;
      }
    } catch (error) {
      // If user doesn't exist, then show role selection
      setTempCredential(credentialResponse.credential);
      setOpenRoleDialog(true);
    }
  };

  const handleRoleSelect = async () => {
    try {
      const data = await handleGoogleLogin(tempCredential, selectedRole, false);
      if (data.token) {
        // The token is already stored in localStorage by handleGoogleLogin
        navigate('/');
        window.location.reload(); // Ensure the app recognizes the new auth state
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
    setOpenRoleDialog(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Sign In
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
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
            autoComplete="current-password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>

        <Divider sx={{ width: '100%', my: 2 }}>OR</Divider>

        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Login Failed')}
            useOneTap={false}
            cookiePolicy={'single_host_origin'}
            scope="email profile"
            prompt="select_account"
          />
        </Box>
      </Paper>
      {/* Role Selection Dialog */}
      <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)}>
        <DialogTitle>Select Your Role</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <FormControlLabel value="artist" control={<Radio />} label="Artist" />
            <FormControlLabel value="buyer" control={<Radio />} label="Buyer" />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
          <Button onClick={handleRoleSelect} variant="contained" disabled={!selectedRole}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;