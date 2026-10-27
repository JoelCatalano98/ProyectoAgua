const Locality = require('../models/localityModel');
const Zone = require('../models/zoneModel');
const Client = require('../models/clientModel');
const AppError = require('../utils/AppError');

const getAllLocalities = async (filter = {}) => {
  const query = {};
  if (filter.zona) {
    query.zona = filter.zona;
  }
  return Locality.find(query).populate('zona').sort({ nombre: 1 });
};

const getLocalityById = async (id) => {
  const locality = await Locality.findById(id).populate('zona');
  if (!locality) {
    throw new AppError('Localidad no encontrada', 404);
  }
  return locality;
};

const createLocality = async (data) => {
  if (!data.zona) {
    throw new AppError('La zona es requerida', 400);
  }
  const zoneExists = await Zone.findById(data.zona);
  if (!zoneExists) {
    throw new AppError('La zona especificada no existe', 400);
  }

  const created = await Locality.create(data);
  return Locality.findById(created._id).populate('zona');
};

const updateLocality = async (id, data) => {
  const locality = await Locality.findById(id);
  if (!locality) {
    throw new AppError('Localidad no encontrada', 404);
  }

  if (data.zona) {
    const zoneExists = await Zone.findById(data.zona);
    if (!zoneExists) {
      throw new AppError('La zona especificada no existe', 400);
    }
  }

  Object.assign(locality, data);
  await locality.save();
  return Locality.findById(id).populate('zona');
};

const deleteLocality = async (id) => {
  const locality = await Locality.findById(id);
  if (!locality) {
    throw new AppError('Localidad no encontrada', 404);
  }

  // Regla de negocio: No permitir borrar una Locality con clientes
  const clientCount = await Client.countDocuments({ localidad: id });
  if (clientCount > 0) {
    throw new AppError(
      `No se puede eliminar la localidad porque tiene ${clientCount} cliente(s) asociado(s)`,
      400
    );
  }

  await Locality.findByIdAndDelete(id);
  return { message: 'Localidad eliminada correctamente', id };
};

module.exports = {
  getAllLocalities,
  getLocalityById,
  createLocality,
  updateLocality,
  deleteLocality
};
