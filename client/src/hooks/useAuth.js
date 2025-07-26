import { useState, useEffect } from 'react';
import { login, register, verifyToken } from '../services/auth';

// Get tab-specific storage key
const getStorageKey = (key) => {
  const tabId = sessionStorage.getItem('tabId') || `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  if (!sessionStorage.getItem('tabId')) {
    sessionStorage.setItem('tabId', tabId);
  }
  return `${key}_${tabId}`;
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = sessionStorage.getItem(getStorageKey('token'));
    if (token) {
      try {
        // Verify token and get user data
        const userData = await verifyToken(token);
        setUser(userData.user);
        setError(null);
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear invalid token
        sessionStorage.removeItem(getStorageKey('token'));
        sessionStorage.removeItem(getStorageKey('user'));
        setUser(null);
        setError(error.message);
      }
    }
    setLoading(false);
  };

  const handleLogin = async (credentials) => {
    try {
      setError(null);
      const { token, user } = await login(credentials);
      sessionStorage.setItem(getStorageKey('token'), token);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    }
  };

  const handleRegister = async (userData) => {
    try {
      setError(null);
      const { token, user } = await register(userData);
      sessionStorage.setItem(getStorageKey('token'), token);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      throw error;
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(getStorageKey('token'));
      sessionStorage.removeItem(getStorageKey('user'));
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed. Please try again.');
    }
  };

  const clearError = () => {
    setError(null);
  };

  return { 
    user, 
    loading, 
    error,
    login: handleLogin, 
    register: handleRegister, 
    logout: handleLogout,
    clearError
  };
};