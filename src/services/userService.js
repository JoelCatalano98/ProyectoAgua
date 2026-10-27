const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');

const registerUser = async ({ nombre, email, password, rol }) => {
  if (!email || !password) {
    throw new AppError('El email y la contraseña son requeridos', 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('El correo electrónico ya se encuentra registrado', 400);
  }

  const user = await User.create({
    nombre,
    email,
    password,
    rol: rol || 'repartidor'
  });

  return {
    _id: user._id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('El email y la contraseña son requeridos', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  // Mismo mensaje 401 para email no encontrado o contraseña incorrecta
  if (!user) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const secret = process.env.JWT_SECRET || 'secret_fallback_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '2h';

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      rol: user.rol
    },
    secret,
    { expiresIn }
  );

  return {
    token,
    user: {
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    }
  };
};

module.exports = {
  registerUser,
  loginUser
};
