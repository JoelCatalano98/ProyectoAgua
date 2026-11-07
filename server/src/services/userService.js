const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');

const getAllUsers = async () => {
  return User.find().select('-password').sort({ createdAt: -1 });
};

const createUser = async ({ nombre, email, password, rol, activo }) => {
  if (!email || !password) {
    throw new AppError('El email y la contraseña son requeridos', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new AppError('El correo electrónico ya se encuentra registrado', 409);
  }

  const user = await User.create({
    nombre: nombre ? nombre.trim() : '',
    email: email.toLowerCase().trim(),
    password,
    rol: rol || 'repartidor',
    activo: activo !== undefined ? activo : true
  });

  return {
    _id: user._id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    activo: user.activo,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

const registerUser = async (data) => {
  return createUser(data);
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('El email y la contraseña son requeridos', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  // Mismo mensaje 401 para email no encontrado, contraseña incorrecta o usuario inactivo
  if (!user || user.activo === false) {
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
      rol: user.rol,
      activo: user.activo
    }
  };
};

const updateUser = async (id, updateData, currentUserId) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  const isSelf = currentUserId && user._id.toString() === currentUserId.toString();

  // Regla de negocio 1: No se puede desactivar ni quitar el rol admin a sí mismo
  if (isSelf) {
    if (updateData.activo !== undefined && updateData.activo === false) {
      throw new AppError('No puedes desactivar tu propia cuenta de usuario', 400);
    }
    if (updateData.rol !== undefined && updateData.rol !== 'admin' && user.rol === 'admin') {
      throw new AppError('No puedes quitarte el rol de administrador a ti mismo', 400);
    }
  }

  // Regla de negocio 2: No se puede dejar al sistema sin ningún admin activo
  const willDeactivateAdmin =
    user.rol === 'admin' &&
    user.activo === true &&
    ((updateData.activo !== undefined && updateData.activo === false) ||
      (updateData.rol !== undefined && updateData.rol !== 'admin'));

  if (willDeactivateAdmin) {
    const otherActiveAdminsCount = await User.countDocuments({
      _id: { $ne: user._id },
      rol: 'admin',
      activo: true
    });

    if (otherActiveAdminsCount === 0) {
      throw new AppError(
        'No se puede desactivar ni quitar el rol al único administrador activo del sistema',
        400
      );
    }
  }

  if (updateData.nombre !== undefined) {
    user.nombre = updateData.nombre.trim();
  }
  if (updateData.rol !== undefined) {
    user.rol = updateData.rol;
  }
  if (updateData.activo !== undefined) {
    user.activo = updateData.activo;
  }

  await user.save();

  return {
    _id: user._id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    activo: user.activo,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

const resetPassword = async (id, { password }) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  user.password = password;
  await user.save();

  return {
    _id: user._id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    activo: user.activo,
    updatedAt: user.updatedAt
  };
};

const deleteUser = async (id, currentUserId) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  const isSelf = currentUserId && user._id.toString() === currentUserId.toString();
  if (isSelf) {
    throw new AppError('No puedes eliminar tu propia cuenta de usuario', 400);
  }

  if (user.rol === 'admin' && user.activo === true) {
    const otherActiveAdminsCount = await User.countDocuments({
      _id: { $ne: user._id },
      rol: 'admin',
      activo: true
    });

    if (otherActiveAdminsCount === 0) {
      throw new AppError(
        'No se puede eliminar al único administrador activo del sistema',
        400
      );
    }
  }

  await user.deleteOne();

  return {
    ok: true,
    message: 'Usuario eliminado exitosamente'
  };
};

module.exports = {
  getAllUsers,
  createUser,
  registerUser,
  loginUser,
  updateUser,
  resetPassword,
  deleteUser
};
