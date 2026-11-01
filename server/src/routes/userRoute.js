const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas de autenticacion y registro
router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;
