import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/agroApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const fetchMe = async () => {
    try {
      const { data } = await authApi.me();
      setUser(data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const register = async (payload) => {
    setAuthError('');
    const { data } = await authApi.register(payload);
    setUser(data.data.user);
    return data;
  };

  const login = async (payload) => {
    setAuthError('');
    const { data } = await authApi.login(payload);
    setUser(data.data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, setAuthError, register, login, logout, refreshUser: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
