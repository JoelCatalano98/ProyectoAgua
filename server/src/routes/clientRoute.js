const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const verifyToken = require('../middleware/verifyToken');
const validate = require('../middleware/validate');
const { idParamSchema } = require('../middleware/validators/commonValidators');
const {
  createClientSchema,
  updateClientSchema,
  clientQuerySchema
} = require('../middleware/validators/clientValidator');

// Rutas publicas (soporta ?localidad=, ?zona=, ?activo=)
router.get('/', validate(clientQuerySchema, 'query'), clientController.getAll);
router.get('/:id', validate(idParamSchema, 'params'), clientController.getById);

// Rutas protegidas
router.post(
  '/',
  verifyToken,
  validate(createClientSchema, 'body'),
  clientController.create
);
router.put(
  '/:id',
  verifyToken,
  validate(idParamSchema, 'params'),
  validate(updateClientSchema, 'body'),
  clientController.update
);
router.delete(
  '/:id',
  verifyToken,
  validate(idParamSchema, 'params'),
  clientController.remove
);

module.exports = router;
