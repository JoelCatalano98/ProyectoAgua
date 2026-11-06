const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    nombreEmpresa: {
      type: String,
      required: [true, 'El nombre de la empresa es requerido'],
      trim: true,
      minlength: [2, 'El nombre de la empresa debe tener al menos 2 caracteres'],
      maxlength: [80, 'El nombre de la empresa no puede superar los 80 caracteres']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Settings', settingsSchema);
