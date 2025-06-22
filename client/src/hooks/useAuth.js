import { useState, useEffect } from 'react';
import { login, register, verifyToken } from '../services/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Verify token and get user data
        const userData = await verifyToken(token);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const handleLogin = async (credentials) => {
    const { token, user } = await login(credentials);
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const handleRegister = async (userData) => {
    const { token, user } = await register(userData);
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { 
    user, 
    loading, 
    login: handleLogin, 
    register: handleRegister, 
    logout: handleLogout 
  };
};