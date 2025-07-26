import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Get tab-specific storage key
const getStorageKey = (key) => {
  const tabId = sessionStorage.getItem('tabId') || `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  if (!sessionStorage.getItem('tabId')) {
    sessionStorage.setItem('tabId', tabId);
  }
  return `${key}_${tabId}`;
};

// Enhanced error handler
const handleAuthError = (error, defaultMessage) => {
  console.error('Auth error:', error);
  
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return new Error(data?.message || 'Invalid request. Please check your input.');
      case 401:
        return new Error(data?.message || 'Invalid credentials. Please try again.');
      case 403:
        return new Error(data?.message || 'Access denied. Your account may be disabled.');
      case 404:
        return new Error(data?.message || 'User not found. Please check your credentials.');
      case 409:
        return new Error(data?.message || 'An account with this email already exists.');
      case 429:
        return new Error('Too many requests. Please try again later.');
      case 500:
        return new Error('Server error. Please try again later.');
      default:
        return new Error(data?.message || defaultMessage);
    }
  } else if (error.request) {
    // Network error
    return new Error('Network error. Please check your connection and try again.');
  } else {
    // Other error
    return new Error(error.message || defaultMessage);
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
    const { token, user } = response.data;
    
    // Store token securely with tab-specific key
    sessionStorage.setItem(getStorageKey('token'), token);
    sessionStorage.setItem(getStorageKey('user'), JSON.stringify(user));
    
    return response.data;
  } catch (error) {
    throw handleAuthError(error, 'Login failed. Please try again.');
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, userData);
    const { token, user } = response.data;
    
    // Store token securely with tab-specific key
    sessionStorage.setItem(getStorageKey('token'), token);
    sessionStorage.setItem(getStorageKey('user'), JSON.stringify(user));
    
    return response.data;
  } catch (error) {
    throw handleAuthError(error, 'Registration failed. Please try again.');
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
    console.error('Token verification error:', error);
    
    if (error.response?.status === 401) {
      // Token is invalid, clear storage
      sessionStorage.removeItem(getStorageKey('token'));
      sessionStorage.removeItem(getStorageKey('user'));
    }
    
    throw handleAuthError(error, 'Token verification failed.');
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
      sessionStorage.setItem(getStorageKey('token'), response.data.token);
      // Ensure we store the complete user object including the role
      sessionStorage.setItem(getStorageKey('user'), JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw handleAuthError(error, 'Google authentication failed. Please try again.');
  }
};