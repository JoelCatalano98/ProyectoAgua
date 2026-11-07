const mongoose = require('mongoose');

const localitySchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la localidad es requerido'],
      trim: true
    },
    provincia: {
      type: String,
      default: 'Santa Fe',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Locality', localitySchema);
