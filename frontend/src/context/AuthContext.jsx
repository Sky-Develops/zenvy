import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('zenvy_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('zenvy_token');
      if (storedToken) {
        try {
          const profile = await authApi.getCurrentUser();
          setUser(profile);
        } catch {
          authApi.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const register = async (username, email, password) => {
    const res = await authApi.register({ username, email, password });
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

