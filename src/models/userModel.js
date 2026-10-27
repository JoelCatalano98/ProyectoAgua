const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'El formato de correo electrónico no es válido']
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false
    },
    rol: {
      type: String,
      enum: {
        values: ['admin', 'repartidor'],
        message: 'El rol debe ser admin o repartidor'
      },
      default: 'repartidor'
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook asincrónico para hashear contraseña (Mongoose 8 compatible, sin next)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Metodo de instancia para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
