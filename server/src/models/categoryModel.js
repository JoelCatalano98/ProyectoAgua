const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la categoría es requerido'],
      unique: true,
      trim: true
    },
    descripcion: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Category', categorySchema);
