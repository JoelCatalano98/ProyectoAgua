const Settings = require('../models/settingsModel');

const DEFAULT_SETTINGS = {
  nombreEmpresa: 'Mi Empresa de Agua'
};

const getSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(DEFAULT_SETTINGS);
  }
  return settings;
};

const updateSettings = async ({ nombreEmpresa }) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      nombreEmpresa: nombreEmpresa || DEFAULT_SETTINGS.nombreEmpresa
    });
    return settings;
  }

  settings.nombreEmpresa = nombreEmpresa;
  await settings.save();
  return settings;
};

module.exports = {
  getSettings,
  updateSettings
};
