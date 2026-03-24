import { useState, useCallback } from 'react';
import api from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = useCallback(async (nom, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.register(nom, email, password);
      if (res.error) {
        setError(res.error);
        return false;
      }
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('accessToken', res.token);
      return true;
    } catch (err) {
      const errorMsg = err.message || 'Erreur lors de l\'inscription';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      if (res.error) {
        setError(res.error);
        return false;
      }
      if (!res.accessToken) {
        setError('Réponse du serveur invalide');
        return false;
      }
      setUser(res.user);
      setToken(res.accessToken);
      localStorage.setItem('accessToken', res.accessToken);
      return true;
    } catch (err) {
      const errorMsg = err.message || 'Erreur lors de la connexion';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.logout();
      setUser(null);
      setToken(null);
      localStorage.removeItem('accessToken');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, token, loading, error, register, login, logout };
};
