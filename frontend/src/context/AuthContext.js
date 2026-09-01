import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

const computeApiBase = () => {
  const raw = process.env.REACT_APP_API_URL;
  if (!raw) {
    return process.env.NODE_ENV === 'production'
      ? 'https://janvoice-e0vv.onrender.com/api'
      : 'http://localhost:5000/api';
  }

  try {
    // Ensure we have an absolute URL for parsing
    const maybe = raw.startsWith('http') ? raw : `https://${raw}`;
    const u = new URL(maybe);
    // If path contains /api keep up to /api
    const apiIdx = u.pathname.indexOf('/api');
    if (apiIdx !== -1) {
      u.pathname = u.pathname.slice(0, apiIdx + 4);
    } else {
      // If path contains /auth, trim at /auth and ensure /api exists
      const authIdx = u.pathname.indexOf('/auth');
      if (authIdx !== -1) {
        u.pathname = u.pathname.slice(0, authIdx);
        if (!u.pathname.endsWith('/api')) u.pathname = `${u.pathname.replace(/\/$/, '')}/api`;
      } else {
        // otherwise ensure path ends with /api
        if (!u.pathname.endsWith('/api')) u.pathname = `${u.pathname.replace(/\/$/, '')}/api`;
      }
    }

    // return without trailing slash
    return `${u.origin}${u.pathname}`.replace(/\/$/, '');
  } catch (e) {
    // fallback to raw value
    return raw.replace(/\/$/, '');
  }
};

const API_BASE_URL = computeApiBase();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Axios configuration
  axios.defaults.baseURL = API_BASE_URL;

  // defensive: if env was set to a full endpoint (eg. .../api/auth/login)
  // ensure baseURL does not unintentionally include extra path segments like `/auth/login`
  try {
    const parsed = new URL(axios.defaults.baseURL);
    const authIdx = parsed.pathname.indexOf('/auth/login');
    if (authIdx !== -1) {
      parsed.pathname = parsed.pathname.slice(0, parsed.pathname.indexOf('/api') + 4) || '/api';
      axios.defaults.baseURL = `${parsed.origin}${parsed.pathname}`.replace(/\/$/, '');
      console.warn('Normalized axios.baseURL to', axios.defaults.baseURL);
    }
  } catch (e) {
    // ignore parsing errors
  }

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully!');
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async (email, password, role) => {
    try {
      const response = await axios.post('/auth/login', { email, password, role });
      const { token: newToken, ...userData } = response.data;

      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);

      toast.success('Login successful!');
      return { success: true, token: newToken, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userDataInput) => {
    try {
      const response = await axios.post('/auth/register', userDataInput);
      const { token: newToken, ...userData } = response.data;

      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);

      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/auth/profile', profileData);
      setUser(response.data);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
