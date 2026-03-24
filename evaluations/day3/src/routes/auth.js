const express = require('express');
const router = express.Router();

const controller = require('../controllers/authController');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const { registerSchema, loginSchema } = require('../validators/authValidator');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Créer un compte utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *             required:
 *               - nom
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       409:
 *         description: Email déjà utilisé
 *       400:
 *         description: Validation échouée
 *
 * /api/auth/login:
 *   post:
 *     summary: Se connecter et obtenir un JWT
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Connexion réussie, token JWT retourné
 *       401:
 *         description: Identifiants invalides
 *       400:
 *         description: Validation échouée
 *
 * /api/auth/refresh:
 *   post:
 *     summary: Rafraîchir l'access token via le refresh token
 *     tags: [Authentification]
 *     responses:
 *       200:
 *         description: Nouvel access token généré
 *       401:
 *         description: Refresh token invalide ou expiré
 *
 * /api/auth/logout:
 *   post:
 *     summary: Se déconnecter et révoquer le refresh token
 *     tags: [Authentification]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *
 * /api/auth/me:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *       401:
 *         description: Non authentifié
 */

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', authenticate, controller.me);

module.exports = router;
