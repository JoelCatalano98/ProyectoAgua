const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const verifyToken = require('../middleware/verifyToken');
const validate = require('../middleware/validate');
const { updateSettingsSchema } = require('../middleware/validators/settingsValidator');

router.get('/public', settingsController.getPublic);
router.put(
  '/',
  verifyToken,
  validate(updateSettingsSchema, 'body'),
  settingsController.update
);

module.exports = router;
