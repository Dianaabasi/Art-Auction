import React, { createContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (auth.user) {
      setUser(auth.user);
      localStorage.setItem('user', JSON.stringify(auth.user));
    }
  }, [auth.user]);

  useEffect(() => {
    let interval;
    
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          if (tokenData.exp * 1000 < Date.now()) {
            handleLogout();
          }
        } catch (error) {
          handleLogout();
        }
      }
    };

    checkTokenExpiration();
    interval = setInterval(checkTokenExpiration, 60000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    auth.logout();
  };

  const handleLogin = async (credentials) => {
    try {
      const result = await auth.login(credentials);
      setUser(result);
      localStorage.setItem('user', JSON.stringify(result));
      return result;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login: handleLogin,
        register: auth.register, 
        logout: handleLogout,
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};