const mongoose = require('mongoose');

const DIAS_VALIDOS = [
  'Lunes', 'Martes', 'Miércoles', 'Miercoles',
  'Jueves', 'Viernes', 'Sábado', 'Sabado',
  'lunes', 'martes', 'miércoles', 'miercoles',
  'jueves', 'viernes', 'sábado', 'sabado'
];

const zoneSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la zona es requerido'],
      unique: true,
      trim: true
    },
    diasDeReparto: {
      type: [String],
      default: [],
      validate: {
        validator: function (dias) {
          if (!Array.isArray(dias)) return false;
          return dias.every((d) => DIAS_VALIDOS.includes(d));
        },
        message: 'Los días de reparto deben estar comprendidos entre lunes y sábado'
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Zone', zoneSchema);
