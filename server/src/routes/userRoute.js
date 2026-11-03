const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validate = require('../middleware/validate');
const loginRateLimiter = require('../middleware/loginRateLimiter');
const {
  registerUserSchema,
  loginUserSchema
} = require('../middleware/validators/userValidator');

// Rutas de autenticacion y registro
router.post('/register', validate(registerUserSchema, 'body'), userController.register);
router.post(
  '/login',
  loginRateLimiter,
  validate(loginUserSchema, 'body'),
  userController.login
);

module.exports = router;
