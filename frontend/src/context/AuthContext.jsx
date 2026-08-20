import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const userData = await axiosClient.get('/auth/me');
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error("Phiên đăng nhập hết hạn:", error);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (username, password) => {
    const data = await axiosClient.post('/auth/login', { username, password });
    setToken(data.accessToken);
    setUser({
      id: data.id,
      username: data.username,
      fullName: data.fullName,
      role: data.role
    });
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify({
      id: data.id,
      username: data.username,
      fullName: data.fullName,
      role: data.role
    }));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
