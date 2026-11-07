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
      trim: true
    },
    localidad: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Locality',
      required: [true, 'La localidad es requerida'],
      index: true
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

// Nombre de zona único dentro de cada localidad
zoneSchema.index({ localidad: 1, nombre: 1 }, { unique: true });

module.exports = mongoose.model('Zone', zoneSchema);
