import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getCurrentUser, login as loginUser, logout as logoutUser, refreshUser, register as registerUser } from '../data/mockauth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [token, setToken] = useState(() => localStorage.getItem('shramsetu_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      setUser(getCurrentUser());
      setToken(localStorage.getItem('shramsetu_token'));
    };

    syncAuth();
    window.addEventListener('auth:updated', syncAuth);

    return () => window.removeEventListener('auth:updated', syncAuth);
  }, []);

  const login = async (email, password, role = 'customer') => {
    setLoading(true);
    try {
      const result = await loginUser(email, password, role);
      if (result.success) {
        setUser(result.user);
        setToken(localStorage.getItem('shramsetu_token'));
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const result = await registerUser(payload);
      if (result.success) {
        setUser(result.user);
        setToken(localStorage.getItem('shramsetu_token'));
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setToken(null);
  };

  const refresh = async () => {
    const result = await refreshUser();
    if (result.success) {
      setUser(result.user);
      setToken(localStorage.getItem('shramsetu_token'));
    } else {
      setUser(null);
      setToken(null);
    }
    return result;
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshUser: refresh }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
