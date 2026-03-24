const express = require('express');
const router = express.Router();

const controller = require('../controllers/livreController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { livreCreateSchema, livreUpdateSchema } = require('../validators/livreValidator');

/**
 * @swagger
 * /api/livres:
 *   get:
 *     summary: Récupérer tous les livres
 *     tags: [Livres]
 *     responses:
 *       200:
 *         description: Liste des livres
 *   post:
 *     summary: Ajouter un nouveau livre
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               auteur:
 *                 type: string
 *               annee:
 *                 type: integer
 *               genre:
 *                 type: string
 *             required:
 *               - titre
 *               - auteur
 *     responses:
 *       201:
 *         description: Livre créé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *
 * /api/livres/{id}:
 *   get:
 *     summary: Récupérer un livre par ID
 *     tags: [Livres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détail du livre
 *       404:
 *         description: Livre non trouvé
 *   put:
 *     summary: Modifier un livre
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               auteur:
 *                 type: string
 *               annee:
 *                 type: integer
 *               genre:
 *                 type: string
 *     responses:
 *       200:
 *         description: Livre modifié avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Livre non trouvé
 *   delete:
 *     summary: Supprimer un livre (Admin uniquement)
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
 *         description: Livre supprimé avec succès
 *       401:
 *         description: Non authentifié
 * /api/livres/{id}/emprunter:
 *   post:
 *     summary: Emprunter un livre
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
 *       200:
 *         description: Livre emprunté avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Livre non trouvé
 *       409:
 *         description: Livre non disponible
 *
 * /api/livres/{id}/retourner:
 *   post:
 *     summary: Retourner un livre emprunté
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
 *       200:
 *         description: Livre retourné avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Emprunt non trouvé
 */

router.get('/', controller.getAll);
router.post('/', authenticate, authorize('admin'), validate(livreCreateSchema), controller.create);
router.get('/:id', controller.getOne);
router.put('/:id', authenticate, authorize('admin'), validate(livreUpdateSchema), controller.update);
router.delete('/:id', authenticate, authorize('admin'), controller.delete);
router.post('/:id/emprunter', authenticate, controller.emprunter);
router.post('/:id/retourner', authenticate, controller.retourner);

module.exports = router;
