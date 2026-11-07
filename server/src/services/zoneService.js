const Zone = require('../models/zoneModel');
const Locality = require('../models/localityModel');
const Client = require('../models/clientModel');
const AppError = require('../utils/AppError');

const getAllZones = async (filter = {}) => {
  const query = {};
  if (filter.localidad) {
    query.localidad = filter.localidad;
  }
  return Zone.find(query).populate('localidad').sort({ nombre: 1 });
};

const getZoneById = async (id) => {
  const zone = await Zone.findById(id).populate('localidad');
  if (!zone) {
    throw new AppError('Zona no encontrada', 404);
  }
  return zone;
};

const createZone = async (data) => {
  if (!data.nombre || !data.nombre.trim()) {
    throw new AppError('El nombre de la zona es requerido', 400, [
      { campo: 'nombre', mensaje: 'El nombre de la zona es requerido' }
    ]);
  }

  if (!data.localidad) {
    throw new AppError('La localidad es requerida', 400, [
      { campo: 'localidad', mensaje: 'La localidad es requerida' }
    ]);
  }

  const localityExists = await Locality.findById(data.localidad);
  if (!localityExists) {
    throw new AppError('La localidad especificada no existe', 400, [
      { campo: 'localidad', mensaje: 'La localidad especificada no existe' }
    ]);
  }

  const existing = await Zone.findOne({
    localidad: data.localidad,
    nombre: data.nombre.trim()
  });
  if (existing) {
    throw new AppError('Ya existe una zona con ese nombre en la localidad seleccionada', 409, [
      { campo: 'nombre', mensaje: 'Ya existe una zona con ese nombre en la localidad seleccionada' }
    ]);
  }

  const created = await Zone.create(data);
  return Zone.findById(created._id).populate('localidad');
};

const updateZone = async (id, data) => {
  const zone = await Zone.findById(id);
  if (!zone) {
    throw new AppError('Zona no encontrada', 404);
  }

  const targetLocalidad = data.localidad || zone.localidad;
  if (data.localidad) {
    const localityExists = await Locality.findById(data.localidad);
    if (!localityExists) {
      throw new AppError('La localidad especificada no existe', 400, [
        { campo: 'localidad', mensaje: 'La localidad especificada no existe' }
      ]);
    }
  }

  const targetNombre = data.nombre !== undefined ? data.nombre.trim() : zone.nombre;
  const isNameChanged = data.nombre !== undefined && targetNombre !== zone.nombre;
  const isLocalityChanged = data.localidad && data.localidad.toString() !== zone.localidad.toString();

  if (isNameChanged || isLocalityChanged) {
    const existing = await Zone.findOne({
      localidad: targetLocalidad,
      nombre: targetNombre
    });
    if (existing && existing._id.toString() !== id) {
      throw new AppError('Ya existe una zona con ese nombre en la localidad seleccionada', 409, [
        { campo: 'nombre', mensaje: 'Ya existe una zona con ese nombre en la localidad seleccionada' }
      ]);
    }
  }

  Object.assign(zone, data);
  await zone.save();
  return Zone.findById(id).populate('localidad');
};

const deleteZone = async (id) => {
  const zone = await Zone.findById(id);
  if (!zone) {
    throw new AppError('Zona no encontrada', 404);
  }

  // Regla de negocio: No permitir borrar una Zone con clientes
  const clientCount = await Client.countDocuments({ zona: id });
  if (clientCount > 0) {
    const pluralText = clientCount === 1 ? '1 cliente asociado' : `${clientCount} clientes asociados`;
    throw new AppError(
      `No se puede eliminar la zona porque tiene ${pluralText}`,
      409
    );
  }

  await Zone.findByIdAndDelete(id);
  return { message: 'Zona eliminada correctamente', id };
};

module.exports = {
  getAllZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone
};
