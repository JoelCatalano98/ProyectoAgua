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

const createLocality = async (overrides = {}) => {
  return Locality.create({
    nombre: `Localidad ${uniqueId()}`,
    provincia: 'Santa Fe',
    ...overrides
  });
};

const createZone = async (localityId = null, overrides = {}) => {
  let targetLocalityId = localityId;
  let targetOverrides = overrides;

  // Si el primer parámetro es un objeto de overrides en vez de un ID
  if (localityId && typeof localityId === 'object' && !localityId._bsontype && !localityId._id) {
    targetOverrides = localityId;
    targetLocalityId = targetOverrides.localidad || null;
  }

  if (!targetLocalityId) {
    const loc = await createLocality();
    targetLocalityId = loc._id;
  }

  return Zone.create({
    nombre: `Zona ${uniqueId()}`,
    localidad: targetLocalityId,
    diasDeReparto: ['Lunes', 'Miércoles', 'Viernes'],
    ...targetOverrides
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

const createClient = async (zoneId = null, overrides = {}) => {
  let targetZoneId = zoneId;
  let targetOverrides = overrides;

  if (zoneId && typeof zoneId === 'object' && !zoneId._bsontype && !zoneId._id) {
    targetOverrides = zoneId;
    targetZoneId = targetOverrides.zona || null;
  }

  if (!targetZoneId) {
    const zone = await createZone();
    targetZoneId = zone._id;
  }

  return Client.create({
    nombre: `Cliente ${uniqueId()}`,
    telefono: '342-1234567',
    direccion: 'Calle Falsa 123',
    zona: targetZoneId,
    envasesEnPoder: 2,
    saldo: 0,
    activo: true,
    observaciones: 'Sin observaciones',
    ...targetOverrides
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
  createLocality,
  createZone,
  createProduct,
  createClient,
  createUser,
  createSettings
};
