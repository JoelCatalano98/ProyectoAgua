const settingsService = require('../services/settingsService');

const getPublic = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    res.status(200).json({
      nombreEmpresa: settings.nombreEmpresa
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const settings = await settingsService.updateSettings(req.body);
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublic,
  update
};
