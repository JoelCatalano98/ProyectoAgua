const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del cliente es requerido'],
      trim: true
    },
    telefono: {
      type: String,
      trim: true,
      default: ''
    },
    direccion: {
      type: String,
      required: [true, 'La dirección es requerida'],
      trim: true
    },
    localidad: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Locality',
      required: [true, 'La localidad es requerida'],
      index: true
    },
    envasesEnPoder: {
      type: Number,
      default: 0,
      min: [0, 'Los envases en poder no pueden ser un número negativo']
    },
    saldo: {
      type: Number,
      default: 0
    },
    activo: {
      type: Boolean,
      default: true
    },
    observaciones: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Client', clientSchema);
