import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('rental_token')) {
      setLoading(false);
      return;
    }
    authService.me()
      .then((result) => setUser(result.user || result))
      .catch(() => {
        localStorage.removeItem('rental_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const result = await authService.login(credentials);
    localStorage.setItem('rental_token', result.token);
    setUser(result.user);
    return result.user;
  }

  async function register(values) {
    const result = await authService.register(values);
    if (result.token && result.user) {
      localStorage.setItem('rental_token', result.token);
      setUser(result.user);
    }
    return result;
  }

  function logout() {
    localStorage.removeItem('rental_token');
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
