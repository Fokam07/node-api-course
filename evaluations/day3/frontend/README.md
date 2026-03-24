# Frontend Day 3 - React App

Application React pour interagir avec l'API Bibliothèque.

## Installation

```bash
cd frontend
npm install
npm start
```

L'app se lance sur http://localhost:3000

## Fonctionnalités

✅ **Authentification**
- Inscription avec validation
- Connexion avec JWT
- Refresh token en cookie HttpOnly
- Logout avec révocation du token

✅ **Gestion des Livres**
- Liste des livres publique
- Emprunt/Retour de livres
- Admin : Créer, modifier, supprimer des livres

✅ **Sécurité**
- Tokens sauvegardés en localStorage
- CORS activé
- JWT Bearer tokens dans les requêtes

✅ **Design**
- UI moderne avec gradient
- Responsive sur mobile
- Feedback utilisateur (loading, erreurs)
- Cards pour les livres

## Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   └── Livres.js
│   ├── services/
│   │   └── api.js          # Appels API
│   ├── hooks/
│   │   └── useAuth.js      # Hook authen
│   ├── App.js              # Composant principal
│   └── index.js            # Entry point
└── package.json
```

## Variables d'environnement

L'API est appelée sur http://localhost:3000 par défaut.

Pour changer, éditer `src/services/api.js` et modifier `API_URL`.
