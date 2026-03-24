import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import api from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import Livres from './pages/Livres';
import './App.css';

function App() {
  const { token, logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [page, setPage] = useState('login');
  const [loading, setLoading] = useState(false);

  // Charger le profil au montage du composant s'il y a un token sauvegardé
  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    if (savedToken) {
      fetchUserProfile(savedToken);
    }
  }, []);

  // Charger le profil quand le token change
  useEffect(() => {
    if (token && !userProfile) {
      fetchUserProfile(token);
    }
  }, [token, userProfile]);

  const fetchUserProfile = async (accessToken) => {
    setLoading(true);
    try {
      const profile = await api.me(accessToken);
      if (profile && !profile.error) {
        setUserProfile(profile);
        setPage('livres'); // Assurer la redirection une fois le profil chargé
      } else {
        localStorage.removeItem('accessToken');
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Erreur de profil:', err);
      setUserProfile(null);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserProfile(null);
    setPage('login');
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  // Non authentifié
  if (!token || !userProfile) {
    return (
      <div className="app">
        <div className="auth-container">
          <div className="auth-nav">
            <button
              className={`tab-btn ${page === 'login' ? 'active' : ''}`}
              onClick={() => setPage('login')}
            >
              Connexion
            </button>
            <button
              className={`tab-btn ${page === 'register' ? 'active' : ''}`}
              onClick={() => setPage('register')}
            >
              Inscription
            </button>
          </div>

          {page === 'login' ? (
            <Login onSuccess={() => setPage('livres')} />
          ) : (
            <Register onSuccess={() => setPage('login')} />
          )}
        </div>
      </div>
    );
  }

  // Authentifié - Afficher les livres
  return (
    <div className="app">
      <Livres
        token={token}
        isAdmin={userProfile.role === 'admin'}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
