const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const verifyToken = require('../middleware/verifyToken');

// Rutas publicas (soporta ?localidad=, ?zona=, ?activo=)
router.get('/', clientController.getAll);
router.get('/:id', clientController.getById);

// Rutas protegidas
router.post('/', verifyToken, clientController.create);
router.put('/:id', verifyToken, clientController.update);
router.delete('/:id', verifyToken, clientController.remove);

module.exports = router;
