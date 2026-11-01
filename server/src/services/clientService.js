const Client = require('../models/clientModel');
const Locality = require('../models/localityModel');
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

  // Filtro por zona: busca todas las localidades pertenecientes a dicha zona
  if (filter.zona) {
    const localitiesInZone = await Locality.find({ zona: filter.zona }).select('_id');
    const localityIds = localitiesInZone.map((l) => l._id.toString());

    if (filter.localidad) {
      if (localityIds.includes(filter.localidad.toString())) {
        query.localidad = filter.localidad;
      } else {
        // La localidad solicitada no pertenece a la zona filtrada
        query.localidad = { $in: [] };
      }
    } else {
      query.localidad = { $in: localitiesInZone.map((l) => l._id) };
    }
  } else if (filter.localidad) {
    query.localidad = filter.localidad;
  }

  return Client.find(query)
    .populate({
      path: 'localidad',
      populate: { path: 'zona' }
    })
    .sort({ nombre: 1 });
};

const getClientById = async (id) => {
  const client = await Client.findById(id).populate({
    path: 'localidad',
    populate: { path: 'zona' }
  });

  if (!client) {
    throw new AppError('Cliente no encontrado', 404);
  }
  return client;
};

const createClient = async (data) => {
  if (!data.localidad) {
    throw new AppError('La localidad es requerida', 400);
  }

  const localityExists = await Locality.findById(data.localidad);
  if (!localityExists) {
    throw new AppError('La localidad especificada no existe', 400);
  }

  const client = await Client.create(data);
  return Client.findById(client._id).populate({
    path: 'localidad',
    populate: { path: 'zona' }
  });
};

const updateClient = async (id, data) => {
  const client = await Client.findById(id);
  if (!client) {
    throw new AppError('Cliente no encontrado', 404);
  }

  if (data.localidad) {
    const localityExists = await Locality.findById(data.localidad);
    if (!localityExists) {
      throw new AppError('La localidad especificada no existe', 400);
    }
  }

  Object.assign(client, data);
  await client.save();

  return Client.findById(id).populate({
    path: 'localidad',
    populate: { path: 'zona' }
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
