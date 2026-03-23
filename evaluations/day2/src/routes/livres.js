const express = require('express');
const router = express.Router();

const controller = require('../controllers/livreController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { livreCreateSchema, livreUpdateSchema } = require('../validators/livreValidator');

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);

router.post('/', authenticate, validate(livreCreateSchema), controller.create);
router.put('/:id', authenticate, validate(livreUpdateSchema), controller.update);

router.delete('/:id', authenticate, authorize('admin'), controller.delete);

router.post('/:id/emprunter', authenticate, controller.emprunter);
router.post('/:id/retourner', authenticate, controller.retourner);

module.exports = router;