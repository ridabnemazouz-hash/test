import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      const parsed = JSON.parse(storedUser);
      const savedAvatar = localStorage.getItem(`avatar_${parsed.email}`);
      if (savedAvatar) {
        parsed.avatar = savedAvatar;
      }
      setUser(parsed);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      const userObj = data.user;
      const savedAvatar = localStorage.getItem(`avatar_${userObj.email}`);
      if (savedAvatar) {
        userObj.avatar = savedAvatar;
      }
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const switchRole = (roleName) => {
    if (user) {
      const updated = { ...user, role: roleName };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  const updateAvatar = (dataUrl) => {
    if (user?.email) {
      localStorage.setItem(`avatar_${user.email}`, dataUrl);
      const updated = { ...user, avatar: dataUrl };
      setUser(updated);
    }
  };

  const removeAvatar = () => {
    if (user?.email) {
      localStorage.removeItem(`avatar_${user.email}`);
      const updated = { ...user, avatar: undefined };
      setUser(updated);
    }
  };

  const updateProfile = (updates) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, loading, updateAvatar, removeAvatar, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
