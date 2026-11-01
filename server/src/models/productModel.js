const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es requerido'],
      trim: true
    },
    descripcion: {
      type: String,
      trim: true,
      default: ''
    },
    precio: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio no puede ser negativo']
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'El stock no puede ser negativo']
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La categoría es requerida'],
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
