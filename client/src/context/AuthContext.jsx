import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('queue-cure-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('queue-cure-token'));

  useEffect(() => {
    if (user) {
      localStorage.setItem('queue-cure-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('queue-cure-user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('queue-cure-token', token);
    } else {
      localStorage.removeItem('queue-cure-token');
    }
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      async login(credentials) {
        const response = await api.login(credentials);
        setToken(response.token);
        setUser(response.user);
        return response.user;
      },
      logout() {
        setToken(null);
        setUser(null);
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };