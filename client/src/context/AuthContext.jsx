import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAccessToken, clearAccessToken } from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try silent refresh on app mount — restores session from httpOnly cookie
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        if (data.success) {
          setAccessToken(data.data.accessToken);
          setUser(data.data.user);
        }
      } catch (err) {
        // No valid refresh token — user stays logged out
        clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    tryRefresh();
  }, []);

  const login = useCallback(async (phone, password) => {
    const { data } = await api.post('/auth/login', { phone, password });

    if (data.success) {
      setAccessToken(data.data.accessToken);
      setUser(data.data.user);
    }

    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await api.post('/auth/register', formData);

    if (data.success) {
      setAccessToken(data.data.accessToken);
      setUser(data.data.user);
    }

    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Logout even if API call fails
    }
    clearAccessToken();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
