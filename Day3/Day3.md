# 📕 Jour 3 — Authentification, Sécurité & Mise en production

> **Durée :** 7h | **Niveau :** Intermédiaire → Confirmé  
> **Objectif :** Sécuriser une API avec JWT, protéger les données, documenter avec Swagger, et préparer le déploiement.

---

## 🗓️ Planning de la journée

| Créneau | Contenu |
|---|---|
| 09h00 – 12h30 | Cours + TP guidés |
| 12h30 – 13h30 | Pause déjeuner |
| 13h30 – 14h00 | Rappel & questions |
| 14h00 – 16h00 | **Évaluation finale notée** |

---

## 🧠 PARTIE COURS — Matin (3h30)

### 1. Authentification vs Autorisation (15 min)

Ces deux concepts sont souvent confondus :

| Concept | Question | Exemple |
|---|---|---|
| **Authentification** | *Qui es-tu ?* | Vérifier login/mot de passe, valider un JWT |
| **Autorisation** | *Qu'as-tu le droit de faire ?* | L'admin peut supprimer, l'user peut juste lire |

#### Stratégies d'authentification

- **Sessions** : Le serveur stocke l'état (stateful). Adapté aux applications web classiques.
- **JWT (JSON Web Token)** : Le client stocke le token (stateless). Idéal pour les API REST.
- **OAuth 2.0 / OpenID Connect** : Délégation d'authentification (Google, GitHub...).

→ Dans ce cours, nous utilisons **JWT**.

---

### 2. Hachage des mots de passe avec bcrypt (30 min)

> ⚠️ **Règle absolue :** Ne jamais stocker un mot de passe en clair.

```bash
npm install bcrypt
```

#### Hacher un mot de passe

```javascript
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12; // Plus élevé = plus sûr mais plus lent (10-12 recommandé)

async function hashPassword(plaintext) {
  const hash = await bcrypt.hash(plaintext, SALT_ROUNDS);
  return hash;
  // Exemple: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8...'
}

async function verifyPassword(plaintext, hash) {
  const match = await bcrypt.compare(plaintext, hash);
  return match; // true ou false
}

// Utilisation
const hash = await hashPassword('monMotDePasse123');
const ok = await verifyPassword('monMotDePasse123', hash); // true
const fail = await verifyPassword('mauvaisMotDePasse', hash); // false
```

#### Table `users` dans la base

```javascript
// db/database.js — ajouter à l'initialisation
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    username     TEXT    NOT NULL UNIQUE,
    email        TEXT    NOT NULL UNIQUE,
    password     TEXT    NOT NULL,
    role         TEXT    NOT NULL DEFAULT 'user',
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);
```

#### Controller d'inscription

```javascript
// controllers/authController.js
const bcrypt = require('bcrypt');
const db = require('../db/database');

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Vérifier si l'email existe déjà
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = db.prepare(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
    ).run(username, email, hashedPassword);
    
    const user = db.prepare('SELECT id, username, email, role FROM users WHERE id = ?')
      .get(result.lastInsertRowid);
    
    res.status(201).json({ message: 'Compte créé', user });
  } catch (err) {
    next(err);
  }
};
```

---

### 3. JSON Web Tokens (JWT) (60 min)

#### Qu'est-ce qu'un JWT ?

Un JWT est une chaîne encodée en Base64 composée de 3 parties séparées par des `.` :

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJyb2xlIjoidXNlciJ9.abc123
       ↑                           ↑                              ↑
   HEADER                       PAYLOAD                       SIGNATURE
(algo, type)           (données: sub, exp, role...)     (HMAC du header+payload)
```

**Payload typique :**
```json
{
  "sub": "42",
  "username": "alice",
  "role": "admin",
  "iat": 1716300000,
  "exp": 1716386400
}
```

> ⚠️ Le payload est **encodé** (Base64), pas **chiffré**. Ne jamais y mettre des données sensibles (mot de passe, carte bancaire...).

```bash
npm install jsonwebtoken
```

#### Générer et vérifier un JWT

```javascript
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET; // Depuis .env, long et aléatoire

// Créer un token
function generateToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    SECRET,
    { expiresIn: '24h' } // '15m', '7d', '1h', etc.
  );
}

// Vérifier un token
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET); // Retourne le payload décodé
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new Error('Token expiré');
    if (err.name === 'JsonWebTokenError') throw new Error('Token invalide');
    throw err;
  }
}
```

#### Controller de connexion

```javascript
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      // Même message pour email inconnu et mauvais mot de passe
      // (sécurité : ne pas révéler si l'email existe)
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    const token = generateToken(user);
    
    res.json({ 
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};
```

---

### 4. Middleware d'authentification et d'autorisation (45 min)

#### Middleware `authenticate` (vérifier le JWT)

```javascript
// middlewares/auth.js
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  
  const token = authHeader.split(' ')[1]; // "Bearer <token>"
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // Accessible dans les routes suivantes
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré, veuillez vous reconnecter' });
    }
    return res.status(401).json({ error: 'Token invalide' });
  }
}

module.exports = { authenticate };
```

#### Middleware `authorize` (vérifier le rôle)

```javascript
// middlewares/auth.js (suite)
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Accès refusé. Rôles requis : ${roles.join(', ')}` 
      });
    }
    
    next();
  };
}

module.exports = { authenticate, authorize };
```

#### Application dans les routes

```javascript
// routes/livres.js
const { authenticate, authorize } = require('../middlewares/auth');

// Route publique — lecture seule
router.get('/', livresController.getAll);
router.get('/:id', livresController.getById);

// Routes protégées — authentification requise
router.post('/', authenticate, validate(livreCreateSchema), livresController.create);
router.put('/:id', authenticate, validate(livreUpdateSchema), livresController.update);

// Route admin uniquement
router.delete('/:id', authenticate, authorize('admin'), livresController.remove);
```

#### Routes d'authentification

```javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Route pour voir son profil (authentification requise)
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
```

---

### 5. Sécurité des API — Les bonnes pratiques (30 min)

```bash
npm install helmet cors express-rate-limit
```

#### Helmet — Headers de sécurité HTTP

```javascript
const helmet = require('helmet');
app.use(helmet()); // Ajoute ~15 headers de sécurité automatiquement
```

#### CORS — Autoriser les origines

```javascript
const cors = require('cors');

// En développement : autoriser tout
app.use(cors());

// En production : whitelist précise
app.use(cors({
  origin: ['https://mon-frontend.com', 'https://app.mon-site.com'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

#### Rate Limiting — Limiter les requêtes

```javascript
const rateLimit = require('express-rate-limit');

// Limiter globalement
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requêtes par fenêtre par IP
  standardHeaders: true,
  message: { error: 'Trop de requêtes, réessayez dans 15 minutes' }
});

// Limiter les tentatives de connexion plus strictement
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentatives de login par 15 min
  message: { error: 'Trop de tentatives, compte temporairement bloqué' }
});

app.use(globalLimiter);
app.use('/api/auth/login', authLimiter);
```

#### app.js final sécurisé

```javascript
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Sécurité
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Parsing
app.use(express.json({ limit: '10kb' })); // Limiter la taille du body

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/livres', require('./routes/livres'));

// Gestion des erreurs
app.use(require('./middlewares/errorHandler').notFound);
app.use(require('./middlewares/errorHandler').errorHandler);

module.exports = app;
```

---

### 6. Documentation avec Swagger/OpenAPI (30 min)

```bash
npm install swagger-jsdoc swagger-ui-express
```

```javascript
// docs/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Bibliothèque',
      version: '1.0.0',
      description: 'API de gestion de bibliothèque',
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: ['./routes/*.js'], // Cherche les annotations JSDoc dans les routes
};

module.exports = swaggerJsdoc(options);
```

#### Annotations JSDoc dans les routes

```javascript
/**
 * @swagger
 * /api/livres:
 *   get:
 *     summary: Récupérer tous les livres
 *     tags: [Livres]
 *     parameters:
 *       - in: query
 *         name: disponible
 *         schema:
 *           type: boolean
 *         description: Filtrer par disponibilité
 *     responses:
 *       200:
 *         description: Liste des livres
 *
 * /api/livres/{id}:
 *   delete:
 *     summary: Supprimer un livre
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Droits insuffisants
 */
```

```javascript
// app.js — ajouter
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Interface disponible sur http://localhost:3000/api-docs
```

---

### 7. Déploiement — Aperçu (15 min)

#### Variables d'environnement en production

```bash
# .env production
NODE_ENV=production
PORT=8080
JWT_SECRET=<généré_avec_openssl_rand_base64_64>
DB_PATH=/app/data/bibliotheque.db
ALLOWED_ORIGINS=https://mon-frontend.com
```

#### Générer un secret JWT fort

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### `package.json` prêt pour la prod

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "lint": "eslint ."
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### Déploiement sur Railway / Render (gratuit)

1. Pusher le code sur GitHub (sans `.env` ni `node_modules`)
2. Créer un compte Railway ou Render
3. Connecter le repo GitHub
4. Définir les variables d'environnement dans l'interface
5. Le service se déploie automatiquement à chaque `git push`

---

## 🔄 RAPPEL — Début d'après-midi (30 min)

### Le flux d'authentification JWT

```
1. POST /api/auth/register  →  Créer compte, hacher mot de passe
2. POST /api/auth/login     →  Vérifier identifiants → retourner JWT
3. GET  /api/livres         →  Header: Authorization: Bearer <token>
                                middleware authenticate → req.user = payload
4. DELETE /api/livres/42    →  authenticate + authorize('admin')
```

### Checklist de sécurité

| ✅ | Pratique |
|---|---|
| ☐ | Mots de passe hachés avec bcrypt (rounds ≥ 10) |
| ☐ | Même message d'erreur pour email inconnu ET mauvais mdp |
| ☐ | JWT secret long et aléatoire (≥ 32 chars) |
| ☐ | Token expiré correctement géré |
| ☐ | `helmet()` activé |
| ☐ | Rate limiting sur `/login` |
| ☐ | `express.json({ limit: '10kb' })` |
| ☐ | `.env` dans `.gitignore` |

### Questions fréquentes

**Q: Où stocker le JWT côté client ?**  
Pour une SPA : `localStorage` (simple, mais vulnérable XSS) ou cookie `HttpOnly` (plus sûr). Pour une API mobile : stockage sécurisé de l'OS.

**Q: Comment révoquer un JWT avant expiration ?**  
Deux approches : tenir une blacklist en base (simple), ou utiliser des refresh tokens (meilleure pratique en production).

---

## 📝 ÉVALUATION JOUR 3 — Projet Fil Rouge : API Bibliothèque sécurisée

> ⏱️ **Durée :** 2h | **Barème :** /20

---

### 📋 Contexte

C'est l'évaluation finale. Reprenez la base du Jour 2 et ajoutez l'authentification JWT, l'autorisation par rôle, et les mesures de sécurité.

---

### 🎯 Instructions

Dans votre fork, créez le dossier `evaluations/jour3/`. L'API doit fonctionner sur le port `3000` (ou `process.env.PORT`).

#### Structure attendue

```
evaluations/
└── jour3/
    ├── package.json
    ├── .env.example
    ├── .gitignore
    ├── index.js
    ├── app.js
    ├── routes/
    │   ├── auth.js
    │   └── livres.js
    ├── controllers/
    │   ├── authController.js
    │   └── livresController.js
    ├── middlewares/
    │   ├── auth.js          ← authenticate + authorize
    │   ├── logger.js
    │   └── errorHandler.js
    ├── validators/
    │   ├── authValidator.js
    │   └── livreValidator.js
    └── db/
        └── database.js
```

#### Rôles et permissions

| Route | Public | User (connecté) | Admin |
|---|---|---|---|
| `GET /api/livres` | ✅ | ✅ | ✅ |
| `GET /api/livres/:id` | ✅ | ✅ | ✅ |
| `POST /api/livres` | ❌ | ✅ | ✅ |
| `PUT /api/livres/:id` | ❌ | ✅ (si son livre) | ✅ |
| `DELETE /api/livres/:id` | ❌ | ❌ | ✅ |
| `POST /api/auth/register` | ✅ | — | — |
| `POST /api/auth/login` | ✅ | — | — |
| `GET /api/auth/me` | ❌ | ✅ | ✅ |

---

### ✅ Critères de notation

> 💡 **Note pour Copilot :** Voici le barème complet pour la correction. Évalue le code dans `evaluations/jour3/`. Les fonctionnalités d'authentification JWT et d'autorisation sont au cœur de cette évaluation. Vérifie la logique du code (est-ce que ça ferait ce qui est décrit ?) plutôt que d'exécuter le code. Regarde particulièrement : (1) si les tokens JWT sont bien générés ET vérifiés avec le même secret, (2) si bcrypt est utilisé avec un nombre de rounds ≥ 10, (3) si les middlewares d'auth sont appliqués aux bonnes routes.

---

#### Section 1 — Inscription et connexion `/5 pts`

| Critère | Points |
|---|---|
| `POST /api/auth/register` crée un utilisateur et retourne `201` | 1 pt |
| Le mot de passe est haché avec `bcrypt` (rounds ≥ 10) **avant** insertion en base | 2 pts |
| `POST /api/auth/login` vérifie les identifiants et retourne un token JWT | 1 pt |
| En cas de mauvais identifiants, la réponse est `401` avec **le même message** pour email inconnu et mauvais mot de passe | 1 pt |

---

#### Section 2 — Middleware d'authentification JWT `/5 pts`

| Critère | Points |
|---|---|
| Le middleware `authenticate` extrait le token du header `Authorization: Bearer <token>` | 1 pt |
| Le token est vérifié avec `jwt.verify()` et le secret depuis `.env` | 2 pts |
| Un token expiré ou invalide retourne `401` avec un message explicite | 1 pt |
| Le payload décodé est attaché à `req.user` pour les routes suivantes | 1 pt |

---

#### Section 3 — Autorisation par rôle `/4 pts`

| Critère | Points |
|---|---|
| Un middleware `authorize(...roles)` vérifie `req.user.role` | 2 pts |
| `DELETE /api/livres/:id` est accessible uniquement aux `admin` (retourne `403` sinon) | 1 pt |
| `POST /api/livres` exige d'être authentifié (retourne `401` si pas de token) | 1 pt |

---

#### Section 4 — Sécurité applicative `/4 pts`

| Critère | Points |
|---|---|
| `helmet` est configuré dans `app.js` | 1 pt |
| Un rate limiter est appliqué sur la route `POST /api/auth/login` | 1 pt |
| `express.json()` est configuré avec une limite de taille (ex: `{ limit: '10kb' }`) | 1 pt |
| Un fichier `.env.example` documente toutes les variables d'environnement nécessaires (`PORT`, `JWT_SECRET`, `DB_PATH`, etc.) | 1 pt |

---

#### Section 5 — Route `/api/auth/me` et qualité globale `/2 pts`

| Critère | Points |
|---|---|
| `GET /api/auth/me` retourne les infos de l'utilisateur connecté (depuis `req.user`) avec `authenticate` | 1 pt |
| Le code ne contient pas de données sensibles hardcodées (pas de secret JWT en dur, pas de mot de passe en clair dans le code) | 1 pt |

---

### 🚀 Bonus (hors barème)

- Implémenter un système de refresh token
- Ajouter la documentation Swagger/OpenAPI sur `/api-docs`
- Implémenter `PATCH /api/livres/:id/disponibilite` pour emprunter/retourner un livre
- Déployer l'API sur Railway ou Render et fournir l'URL publique

---

### 📤 Rendu final

1. Pushez votre code sur votre fork GitHub
2. Le code doit être dans `evaluations/jour3/`
3. Vérifiez que `.env`, `node_modules` et `*.db` ne sont **pas** commités
4. Envoyez le lien vers votre fork : `https://github.com/votre-pseudo/node-api-course`

---

### 🏆 Récapitulatif du fil rouge sur 3 jours

| Jour | Ce que vous avez construit |
|---|---|
| Jour 1 | API CRUD en mémoire, Express de base, codes HTTP |
| Jour 2 | Architecture modulaire, validation Joi, persistance SQLite |
| Jour 3 | Authentification JWT, rôles, sécurité, documentation |

**Félicitations ! Vous avez construit une API REST complète, sécurisée et prête pour la production. 🎉**

---

*"First, make it work. Then, make it right. Then, make it fast." — Kent Beck*