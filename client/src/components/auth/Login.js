import React, { useState, useContext } from 'react';
import { 
  Container, Paper, TextField, Button, Typography, Box, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, 
  FormControlLabel, Radio, Alert, CircularProgress, IconButton
} from '@mui/material';
import { 
  Visibility, VisibilityOff, Error as ErrorIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { handleGoogleLogin } from '../../services/auth';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [tempCredential, setTempCredential] = useState(null);

  // Input validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
    
    // Clear general error when user makes changes
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(formData);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error types
      if (error.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (error.response?.status === 403) {
        setError('Account is disabled. Please contact support.');
      } else if (error.response?.status === 429) {
        setError('Too many login attempts. Please try again later.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Try to login directly first
      const data = await handleGoogleLogin(credentialResponse.credential);
      if (data.token) {
        setSuccess('Google login successful! Redirecting...');
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 1000);
        return;
      }
    } catch (error) {
      // If user doesn't exist, then show role selection
      if (error.message?.includes('User not found') || error.response?.status === 404) {
        setTempCredential(credentialResponse.credential);
        setOpenRoleDialog(true);
      } else {
        console.error('Google login error:', error);
        setError('Google login failed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }
    
    setIsGoogleLoading(true);
    setError('');
    
    try {
      const data = await handleGoogleLogin(tempCredential, selectedRole, false);
      if (data.token) {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Google registration error:', error);
      setError(error.message || 'Account creation failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
      setOpenRoleDialog(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
    setFormErrors({});
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Sign In
        </Typography>
        
        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ width: '100%', mb: 2 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={clearMessages}
              >
                <ErrorIcon />
              </IconButton>
            }
          >
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert 
            severity="success" 
            sx={{ width: '100%', mb: 2 }}
            icon={<SuccessIcon />}
          >
            {success}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleInputChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            disabled={isLoading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={formData.password}
            onChange={handleInputChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Signing In...
              </Box>
            ) : (
              'Sign In'
            )}
          </Button>
        </Box>

        <Divider sx={{ width: '100%', my: 2 }}>OR</Divider>

        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          {isGoogleLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Processing...
            </Box>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              cookiePolicy={'single_host_origin'}
              scope="email profile"
              prompt="select_account"
            />
          )}
        </Box>
      </Paper>

      {/* Role Selection Dialog */}
      <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)}>
        <DialogTitle>Select Your Role</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please select your role to complete the registration:
          </Typography>
          <RadioGroup
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <FormControlLabel value="artist" control={<Radio />} label="Artist" />
            <FormControlLabel value="buyer" control={<Radio />} label="Buyer" />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleDialog(false)} disabled={isGoogleLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleRoleSelect} 
            variant="contained" 
            disabled={!selectedRole || isGoogleLoading}
          >
            {isGoogleLoading ? 'Creating Account...' : 'Continue'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;