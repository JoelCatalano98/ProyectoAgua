const Category = require('../../src/models/categoryModel');
const Zone = require('../../src/models/zoneModel');
const Locality = require('../../src/models/localityModel');
const Product = require('../../src/models/productModel');
const Client = require('../../src/models/clientModel');
const User = require('../../src/models/userModel');
const Settings = require('../../src/models/settingsModel');

const uniqueId = () => `${Date.now()}_${Math.random().toString(36).substring(7)}`;

const createCategory = async (overrides = {}) => {
  return Category.create({
    nombre: `Categoría ${uniqueId()}`,
    descripcion: 'Descripción de prueba para la categoría',
    ...overrides
  });
};

const createZone = async (overrides = {}) => {
  return Zone.create({
    nombre: `Zona ${uniqueId()}`,
    diasDeReparto: ['Lunes', 'Miércoles', 'Viernes'],
    ...overrides
  });
};

const createLocality = async (zoneId, overrides = {}) => {
  let targetZoneId = zoneId;
  if (!targetZoneId) {
    const zone = await createZone();
    targetZoneId = zone._id;
  }

  return Locality.create({
    nombre: `Localidad ${uniqueId()}`,
    provincia: 'Santa Fe',
    zona: targetZoneId,
    ...overrides
  });
};

const createProduct = async (categoryId, overrides = {}) => {
  let targetCategoryId = categoryId;
  if (!targetCategoryId) {
    const category = await createCategory();
    targetCategoryId = category._id;
  }

  return Product.create({
    nombre: `Producto ${uniqueId()}`,
    descripcion: 'Descripción de prueba del producto',
    precio: 4500,
    stock: 50,
    categoria: targetCategoryId,
    ...overrides
  });
};

const createClient = async (localityId, overrides = {}) => {
  let targetLocalityId = localityId;
  if (!targetLocalityId) {
    const locality = await createLocality();
    targetLocalityId = locality._id;
  }

  return Client.create({
    nombre: `Cliente ${uniqueId()}`,
    telefono: '342-1234567',
    direccion: 'Calle Falsa 123',
    localidad: targetLocalityId,
    envasesEnPoder: 2,
    saldo: 0,
    activo: true,
    observaciones: 'Sin observaciones',
    ...overrides
  });
};

const createUser = async (overrides = {}) => {
  return User.create({
    nombre: 'Usuario Test',
    email: `usuario_${uniqueId()}@test.com`,
    password: 'password123',
    rol: 'repartidor',
    activo: true,
    ...overrides
  });
};

const createSettings = async (overrides = {}) => {
  return Settings.create({
    nombreEmpresa: 'Mi Empresa de Agua',
    ...overrides
  });
};

module.exports = {
  createCategory,
  createZone,
  createLocality,
  createProduct,
  createClient,
  createUser,
  createSettings
};
