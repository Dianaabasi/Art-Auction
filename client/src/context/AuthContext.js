import React, { createContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { joinUserRoom } from '../services/websocket';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabId] = useState(() => `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Tab-specific storage keys
  const getStorageKey = (key) => `${key}_${tabId}`;

  useEffect(() => {
    const token = sessionStorage.getItem(getStorageKey('token'));
    const storedUser = sessionStorage.getItem(getStorageKey('user'));
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        sessionStorage.removeItem(getStorageKey('token'));
        sessionStorage.removeItem(getStorageKey('user'));
      }
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (auth.user) {
      setUser(auth.user);
      sessionStorage.setItem(getStorageKey('user'), JSON.stringify(auth.user));
    }
  }, [auth.user]);

  useEffect(() => {
    if (user && user._id) {
      joinUserRoom(user._id);
    }
  }, [user]);

  useEffect(() => {
    let interval;
    
    const checkTokenExpiration = () => {
      const token = sessionStorage.getItem(getStorageKey('token'));
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
    sessionStorage.removeItem(getStorageKey('token'));
    sessionStorage.removeItem(getStorageKey('user'));
    setUser(null);
    auth.logout();
  };

  const handleLogin = async (credentials) => {
    try {
      const result = await auth.login(credentials);
      setUser(result);
      sessionStorage.setItem(getStorageKey('user'), JSON.stringify(result));
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