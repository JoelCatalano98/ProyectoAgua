const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const verifyToken = require('../middleware/verifyToken');
const validate = require('../middleware/validate');
const { idParamSchema } = require('../middleware/validators/commonValidators');
const {
  createCategorySchema,
  updateCategorySchema
} = require('../middleware/validators/categoryValidator');

// Rutas públicas
router.get('/', categoryController.getAll);
router.get('/:id', validate(idParamSchema, 'params'), categoryController.getById);

// Rutas protegidas
router.post(
  '/',
  verifyToken,
  validate(createCategorySchema, 'body'),
  categoryController.create
);
router.put(
  '/:id',
  verifyToken,
  validate(idParamSchema, 'params'),
  validate(updateCategorySchema, 'body'),
  categoryController.update
);
router.delete(
  '/:id',
  verifyToken,
  validate(idParamSchema, 'params'),
  categoryController.remove
);

module.exports = router;
