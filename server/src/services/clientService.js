const Client = require('../models/clientModel');
const Zone = require('../models/zoneModel');
const AppError = require('../utils/AppError');

const getAllClients = async (filter = {}) => {
  const query = {};

  // Filtro por estado activo (acepta booleano o string 'true'/'false')
  if (filter.activo !== undefined && filter.activo !== '') {
    if (filter.activo === true || filter.activo === 'true') {
      query.activo = true;
    } else if (filter.activo === false || filter.activo === 'false') {
      query.activo = false;
    }
  }

  // Filtro por zona y/o localidad
  if (filter.zona) {
    if (filter.localidad) {
      // Verificar si la zona pertenece a la localidad especificada
      const zoneDoc = await Zone.findById(filter.zona);
      if (zoneDoc && zoneDoc.localidad.toString() === filter.localidad.toString()) {
        query.zona = filter.zona;
      } else {
        query.zona = { $in: [] };
      }
    } else {
      query.zona = filter.zona;
    }
  } else if (filter.localidad) {
    const zonesInLocality = await Zone.find({ localidad: filter.localidad }).select('_id');
    query.zona = { $in: zonesInLocality.map((z) => z._id) };
  }

  return Client.find(query)
    .populate({
      path: 'zona',
      populate: { path: 'localidad' }
    })
    .sort({ nombre: 1 });
};

const getClientById = async (id) => {
  const client = await Client.findById(id).populate({
    path: 'zona',
    populate: { path: 'localidad' }
  });

  if (!client) {
    throw new AppError('Cliente no encontrado', 404);
  }
  return client;
};

const createClient = async (data) => {
  if (!data.zona) {
    throw new AppError('La zona es requerida', 400, [
      { campo: 'zona', mensaje: 'La zona es requerida' }
    ]);
  }

  const zoneExists = await Zone.findById(data.zona);
  if (!zoneExists) {
    throw new AppError('La zona especificada no existe', 400, [
      { campo: 'zona', mensaje: 'La zona especificada no existe' }
    ]);
  }

  const client = await Client.create(data);
  return Client.findById(client._id).populate({
    path: 'zona',
    populate: { path: 'localidad' }
  });
};

const updateClient = async (id, data) => {
  const client = await Client.findById(id);
  if (!client) {
    throw new AppError('Cliente no encontrado', 404);
  }

  if (data.zona) {
    const zoneExists = await Zone.findById(data.zona);
    if (!zoneExists) {
      throw new AppError('La zona especificada no existe', 400, [
        { campo: 'zona', mensaje: 'La zona especificada no existe' }
      ]);
    }
  }

  Object.assign(client, data);
  await client.save();

  return Client.findById(id).populate({
    path: 'zona',
    populate: { path: 'localidad' }
  });
};

const deleteClient = async (id) => {
  const client = await Client.findById(id);
  if (!client) {
    throw new AppError('Cliente no encontrado', 404);
  }

  await Client.findByIdAndDelete(id);
  return { message: 'Cliente eliminado correctamente', id };
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
