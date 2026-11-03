const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middleware/verifyToken');
const validate = require('../middleware/validate');
const { idParamSchema } = require('../middleware/validators/commonValidators');
const {
  createProductSchema,
  updateProductSchema,
  productQuerySchema
} = require('../middleware/validators/productValidator');

// Rutas públicas (soporta filtro ?categoria=)
router.get('/', validate(productQuerySchema, 'query'), productController.getAll);
router.get('/:id', validate(idParamSchema, 'params'), productController.getById);

// Rutas protegidas
router.post(
  '/',
  verifyToken,
  validate(createProductSchema, 'body'),
  productController.create
);
router.put(
  '/:id',
  verifyToken,
  validate(idParamSchema, 'params'),
  validate(updateProductSchema, 'body'),
  productController.update
);
router.delete(
  '/:id',
  verifyToken,
  validate(idParamSchema, 'params'),
  productController.remove
);

module.exports = router;
