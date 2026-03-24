import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './Livres.css';

const Livres = ({ token, isAdmin, onLogout }) => {
  const [livres, setLivres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    auteur: '',
    annee: '',
    genre: ''
  });

  useEffect(() => {
    fetchLivres();
  }, []);

  const fetchLivres = async () => {
    setLoading(true);
    try {
      const res = await api.getLivres();
      setLivres(res);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des livres');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLivre = async (e) => {
    e.preventDefault();
    try {
      const data = {
        titre: formData.titre,
        auteur: formData.auteur,
        annee: formData.annee ? parseInt(formData.annee) : null,
        genre: formData.genre
      };
      await api.createLivre(data, token);
      setFormData({ titre: '', auteur: '', annee: '', genre: '' });
      setShowForm(false);
      fetchLivres();
    } catch (err) {
      setError('Erreur lors de l\'ajout du livre');
    }
  };

  const handleDeleteLivre = async (id) => {
    if (window.confirm('Êtes-vous sûr ?')) {
      try {
        await api.deleteLivre(id, token);
        fetchLivres();
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  const handleEmprunter = async (id) => {
    try {
      await api.emprunterLivre(id, token);
      fetchLivres();
    } catch (err) {
      setError('Erreur lors de l\'emprunt');
    }
  };

  const handleRetourner = async (id) => {
    try {
      await api.retournerLivre(id, token);
      fetchLivres();
    } catch (err) {
      setError('Erreur lors du retour');
    }
  };

  return (
    <div className="livres-container">
      <header className="livres-header">
        <h1>📚 Bibliothèque</h1>
        <button className="logout-btn" onClick={onLogout}>Se déconnecter</button>
      </header>

      {error && <div className="alert error">{error}</div>}

      {isAdmin && (
        <div className="admin-section">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : '➕ Ajouter un livre'}
          </button>
          {showForm && (
            <form className="livre-form" onSubmit={handleAddLivre}>
              <input
                type="text"
                placeholder="Titre"
                value={formData.titre}
                onChange={(e) => setFormData({...formData, titre: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Auteur"
                value={formData.auteur}
                onChange={(e) => setFormData({...formData, auteur: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Année"
                value={formData.annee}
                onChange={(e) => setFormData({...formData, annee: e.target.value})}
              />
              <input
                type="text"
                placeholder="Genre"
                value={formData.genre}
                onChange={(e) => setFormData({...formData, genre: e.target.value})}
              />
              <button type="submit" className="btn-primary">Créer</button>
            </form>
          )}
        </div>
      )}

      <div className="livres-grid">
        {loading ? (
          <p>Chargement...</p>
        ) : livres.length === 0 ? (
          <p>Aucun livre disponible</p>
        ) : (
          livres.map((livre) => (
            <div key={livre.id} className="livre-card">
              <div className="livre-header">
                <h3>{livre.titre}</h3>
                <span className={`badge ${livre.disponible ? 'disponible' : 'indisponible'}`}>
                  {livre.disponible ? '✓ Disponible' : '✗ Emprunté'}
                </span>
              </div>
              <p><strong>Auteur:</strong> {livre.auteur}</p>
              {livre.annee && <p><strong>Année:</strong> {livre.annee}</p>}
              {livre.genre && <p><strong>Genre:</strong> {livre.genre}</p>}
              
              <div className="livre-actions">
                {livre.disponible && token && (
                  <button className="btn-borrow" onClick={() => handleEmprunter(livre.id)}>
                    Emprunter
                  </button>
                )}
                {!livre.disponible && token && (
                  <button className="btn-return" onClick={() => handleRetourner(livre.id)}>
                    Retourner
                  </button>
                )}
                {isAdmin && (
                  <button className="btn-delete" onClick={() => handleDeleteLivre(livre.id)}>
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Livres;
