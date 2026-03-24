import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

const Register = ({ onSuccess }) => {
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData.nom, formData.email, formData.password);
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="auth-form">
      <h2>Créer un compte</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nom"
          placeholder="Nom"
          value={formData.nom}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe (min 8 caractères)"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'En cours...' : 'S\'inscrire'}
        </button>
      </form>
    </div>
  );
};

export default Register;
