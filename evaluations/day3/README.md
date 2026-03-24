// Jour 3 - Évaluation : API Bibliothèque avec Sécurité Avancée
# API Bibliothèque - Jour 3

## Fonctionnalités implémentées

### 1. **Refresh Tokens** ✅
- Modèle `RefreshToken` dans Prisma (token, userId, expiresAt)
- Access tokens courts (≤ 15m) + Refresh tokens longs (≥ 7j)
- Refresh token stocké en base et en cookie HttpOnly
- Routes `/api/auth/refresh` et `/api/auth/logout` implémentées
- Protection contre la révocation des tokens

### 2. **Sécurité Applicative** ✅
- **Helmet** : Headers de sécurité HTTP
- **CORS** : Mode permissif en développement, liste blanche en production
- **Rate Limiting** :
  - Global : 100 req / 15 min / IP
  - Auth : 10 req / 15 min sur login/register
- **Payload limit** : 10kb max
- **Body destructuring** : Pas d'injection directe de req.body

### 3. **Gestion des Erreurs** ✅
- Middleware `errorHandler` avec 4 paramètres (err, req, res, next)
- Messages génériques en production (erreurs 5xx)
- Logging côté serveur sans données sensibles
- Middleware `notFound` pour routes inconnues

### 4. **Logging** ✅
- **Morgan** : 'dev' en développement, 'combined' en production
- Aucune donnée sensible (passwords, tokens) dans les logs
- Erreurs loggées sans req.body ni Authorization header

### 5. **Documentation Swagger** ✅
- swagger-jsdoc + swagger-ui-express
- Interface accessible sur GET `/api-docs`
- Routes documentées avec @swagger (résumés, paramètres, réponses)
- Codes d'erreur inclus (401, 403, 404, 500)

### 6. **Architecture en Couches** ✅
- **Controllers** : Gestion req/res uniquement
- **Services** : Logique métier
- **Middlewares** : Authentification, validation, gestion d'erreurs
- **Routes** : Configuration des endpoints
- **Validators** : Zod pour validation

## Installation

```bash
cd evaluations/day3
npm install
npx prisma migrate deploy
npm run dev
```

## Variables d'environnement

Voir `.env.example` pour tous les paramètres.

## Points de barème

- **Section 1** : Socle Auth (register, login, bcrypt, JWT) → 3 pts
- **Section 2** : Refresh tokens (stockage, cookie, endpoints) → 4 pts
- **Section 3** : Sécurité applicative (helmet, CORS, rate limit) → 5 pts
- **Section 4** : Gestion erreurs (errorHandler, messages génériques) → 3 pts
- **Section 5** : Logging (Morgan, pas de data sensible) → 2 pts
- **Section 6** : Documentation + qualité code → 3 pts

**Total : 20 pts**

## Bonus possibles

- npm audit sans vulnérabilités critical/high
- Déploiement sur Railway/Render
