const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zoneController');
const verifyToken = require('../middleware/verifyToken');

// Rutas publicas
router.get('/', zoneController.getAll);
router.get('/:id', zoneController.getById);
router.get('/:id/hoja-de-ruta', zoneController.getHojaDeRuta);

// Rutas protegidas
router.post('/', verifyToken, zoneController.create);
router.put('/:id', verifyToken, zoneController.update);
router.delete('/:id', verifyToken, zoneController.remove);

module.exports = router;
