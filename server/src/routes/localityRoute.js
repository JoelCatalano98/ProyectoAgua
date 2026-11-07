const express = require('express');
const router = express.Router();
const localityController = require('../controllers/localityController');
const verifyToken = require('../middleware/verifyToken');
const validate = require('../middleware/validate');
const { idParamSchema } = require('../middleware/validators/commonValidators');
const {
  createLocalitySchema,
  updateLocalitySchema
} = require('../middleware/validators/localityValidator');

// Rutas públicas
router.get('/', localityController.getAll);
router.get('/:id', validate(idParamSchema, 'params'), localityController.getById);
router.get(
  '/:id/hoja-de-ruta',
  validate(idParamSchema, 'params'),
  localityController.getHojaDeRuta
);

// Rutas protegidas
router.post(
  '/',
  verifyToken,
  validate(createLocalitySchema, 'body'),
  localityController.create
);
router.put(
  '/:id',
  verifyToken,
  validate(idParamSchema, 'params'),
  validate(updateLocalitySchema, 'body'),
  localityController.update
);
router.delete(
  '/:id',
  verifyToken,
  validate(idParamSchema, 'params'),
  localityController.remove
);

module.exports = router;
