const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middleware/verifyToken');

// Rutas publicas (soporta ?categoria=)
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// Rutas protegidas
router.post('/', verifyToken, productController.create);
router.put('/:id', verifyToken, productController.update);
router.delete('/:id', verifyToken, productController.remove);

module.exports = router;
