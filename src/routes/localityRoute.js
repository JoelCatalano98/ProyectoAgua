const express = require('express');
const router = express.Router();
const localityController = require('../controllers/localityController');
const verifyToken = require('../middleware/verifyToken');

// Rutas publicas (soporta ?zona=)
router.get('/', localityController.getAll);
router.get('/:id', localityController.getById);

// Rutas protegidas
router.post('/', verifyToken, localityController.create);
router.put('/:id', verifyToken, localityController.update);
router.delete('/:id', verifyToken, localityController.remove);

module.exports = router;
