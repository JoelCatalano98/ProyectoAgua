const jwt = require('jsonwebtoken');
const User = require('../../src/models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_56tests';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      rol: user.rol
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
};

const createAdminAndGetToken = async (overrides = {}) => {
  const adminData = {
    nombre: 'Admin Test',
    email: `admin_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
    password: 'password123',
    rol: 'admin',
    activo: true,
    ...overrides
  };

  const user = await User.create(adminData);
  const token = generateToken(user);

  return {
    user,
    token,
    headers: { Authorization: `Bearer ${token}` }
  };
};

const createRepartidorAndGetToken = async (overrides = {}) => {
  const repartidorData = {
    nombre: 'Repartidor Test',
    email: `repartidor_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
    password: 'password123',
    rol: 'repartidor',
    activo: true,
    ...overrides
  };

  const user = await User.create(repartidorData);
  const token = generateToken(user);

  return {
    user,
    token,
    headers: { Authorization: `Bearer ${token}` }
  };
};

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`
});

module.exports = {
  generateToken,
  createAdminAndGetToken,
  createRepartidorAndGetToken,
  getAuthHeaders
};
