const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zoneController');
const verifyToken = require('../middleware/verifyToken');
const validate = require('../middleware/validate');
const { idParamSchema } = require('../middleware/validators/commonValidators');
const {
  createZoneSchema,
  updateZoneSchema,
  zoneQuerySchema
} = require('../middleware/validators/zoneValidator');

// Rutas públicas (soporta filtro ?localidad=)
router.get('/', validate(zoneQuerySchema, 'query'), zoneController.getAll);
router.get('/:id', validate(idParamSchema, 'params'), zoneController.getById);

// Rutas protegidas
router.post(
  '/',
  verifyToken,
  validate(createZoneSchema, 'body'),
  zoneController.create
);
router.put(
  '/:id',
  verifyToken,
  validate(idParamSchema, 'params'),
  validate(updateZoneSchema, 'body'),
  zoneController.update
);
router.delete(
  '/:id',
  verifyToken,
  validate(idParamSchema, 'params'),
  zoneController.remove
);

module.exports = router;
