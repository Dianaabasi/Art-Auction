import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
    const { token, user } = response.data;
    
    // Store token securely
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Login failed' };
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const verifyToken = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Token verification error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Token verification failed');
  }
};

export const handleGoogleLogin = async (credential, role = null, isRegistration = false) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/google`, {
      credential,
      role,
      isRegistration
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      // Ensure we store the complete user object including the role
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Google auth error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Google authentication failed');
  }
};