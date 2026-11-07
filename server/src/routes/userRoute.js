const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const loginRateLimiter = require('../middleware/loginRateLimiter');
const { idParamSchema } = require('../middleware/validators/commonValidators');
const {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  loginUserSchema
} = require('../middleware/validators/userValidator');

// Rutas de autenticación
router.post(
  '/login',
  loginRateLimiter,
  validate(loginUserSchema, 'body'),
  userController.login
);

// Registro protegido solo para administradores
router.post(
  '/register',
  verifyToken,
  requireRole('admin'),
  validate(createUserSchema, 'body'),
  userController.register
);

// Endpoints administrativos protegidos (solo admin)
router.get('/', verifyToken, requireRole('admin'), userController.getAll);

router.post(
  '/',
  verifyToken,
  requireRole('admin'),
  validate(createUserSchema, 'body'),
  userController.create
);

router.put(
  '/:id',
  verifyToken,
  requireRole('admin'),
  validate(idParamSchema, 'params'),
  validate(updateUserSchema, 'body'),
  userController.update
);

router.patch(
  '/:id/password',
  verifyToken,
  requireRole('admin'),
  validate(idParamSchema, 'params'),
  validate(resetPasswordSchema, 'body'),
  userController.resetPassword
);

module.exports = router;
