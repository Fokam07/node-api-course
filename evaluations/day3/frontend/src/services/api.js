const API_URL = 'http://localhost:3000/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
};

const api = {
  // Auth endpoints
  register: (nom, email, password) =>
    fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, email, password })
    }).then(handleResponse).catch(err => ({ error: err.message })),

  login: (email, password) =>
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(handleResponse).catch(err => ({ error: err.message })),

  refresh: () =>
    fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    }).then(handleResponse).catch(err => ({ error: err.message })),

  logout: () =>
    fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    }).then(handleResponse).catch(err => ({ error: err.message })),

  me: (token) =>
    fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(handleResponse).catch(err => ({ error: err.message })),

  // Livres endpoints
  getLivres: () =>
    fetch(`${API_URL}/livres`).then(res => res.json()).catch(err => []),

  getLivre: (id) =>
    fetch(`${API_URL}/livres/${id}`).then(res => res.json()).catch(err => ({})),

  createLivre: (data, token) =>
    fetch(`${API_URL}/livres`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(handleResponse).catch(err => ({ error: err.message })),

  updateLivre: (id, data, token) =>
    fetch(`${API_URL}/livres/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(handleResponse).catch(err => ({ error: err.message })),

  deleteLivre: (id, token) =>
    fetch(`${API_URL}/livres/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(res => res.status === 204 ? { success: true } : res.json()).catch(err => ({ error: err.message })),

  emprunterLivre: (id, token) =>
    fetch(`${API_URL}/livres/${id}/emprunter`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(handleResponse).catch(err => ({ error: err.message })),

  retournerLivre: (id, token) =>
    fetch(`${API_URL}/livres/${id}/retourner`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(handleResponse).catch(err => ({ error: err.message }))
};

export default api;
