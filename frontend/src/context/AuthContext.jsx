import React, { createContext, useContext, useState } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; }
    catch { return null; }
  });

  // Regular user login (email + password)
  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token, user: u } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  // Admin login (admin_id + email + password)
  const adminLogin = async (admin_id, email, password) => {
    const res = await API.post('/auth/login', { admin_id, email, password });
    const { token, user: u } = res.data;
    if (u.role !== 'admin') throw new Error('Not an admin account.');
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  // Public registration — always creates 'user' role
  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password });
    const { token, user: u } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';

  // Refresh user from server (e.g. after password change)
  const refreshUser = async () => {
    try {
      const res = await API.get('/auth/profile');
      const u = res.data.user;
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
    } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{ user, login, adminLogin, register, logout, isAdmin, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
