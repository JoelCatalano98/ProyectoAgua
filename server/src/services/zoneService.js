const Zone = require('../models/zoneModel');
const Locality = require('../models/localityModel');
const Client = require('../models/clientModel');
const AppError = require('../utils/AppError');

const getAllZones = async () => {
  return Zone.find().sort({ nombre: 1 });
};

const getZoneById = async (id) => {
  const zone = await Zone.findById(id);
  if (!zone) {
    throw new AppError('Zona no encontrada', 404);
  }
  return zone;
};

const createZone = async (data) => {
  if (!data.nombre || !data.nombre.trim()) {
    throw new AppError('El nombre de la zona es requerido', 400);
  }
  const existing = await Zone.findOne({ nombre: data.nombre.trim() });
  if (existing) {
    throw new AppError('Ya existe una zona con ese nombre', 400);
  }
  return Zone.create(data);
};

const updateZone = async (id, data) => {
  const zone = await Zone.findById(id);
  if (!zone) {
    throw new AppError('Zona no encontrada', 404);
  }
  if (data.nombre && data.nombre.trim() !== zone.nombre) {
    const existing = await Zone.findOne({ nombre: data.nombre.trim() });
    if (existing && existing._id.toString() !== id) {
      throw new AppError('Ya existe una zona con ese nombre', 400);
    }
  }
  Object.assign(zone, data);
  return zone.save();
};

const deleteZone = async (id) => {
  const zone = await Zone.findById(id);
  if (!zone) {
    throw new AppError('Zona no encontrada', 404);
  }

  // Regla de negocio: No permitir borrar una Zone con localidades
  const localityCount = await Locality.countDocuments({ zona: id });
  if (localityCount > 0) {
    throw new AppError(
      `No se puede eliminar la zona porque tiene ${localityCount} localidad(es) asociada(s)`,
      400
    );
  }

  await Zone.findByIdAndDelete(id);
  return { message: 'Zona eliminada correctamente', id };
};

/**
 * Extra: Hoja de ruta para repartidores
 * Devuelve los clientes activos de las localidades de esa zona, ordenados por localidad y dirección
 */
const getHojaDeRuta = async (zoneId) => {
  const zone = await Zone.findById(zoneId);
  if (!zone) {
    throw new AppError('Zona no encontrada', 404);
  }

  const localities = await Locality.find({ zona: zoneId }).select('_id nombre');
  const localityIds = localities.map((l) => l._id);

  const clients = await Client.find({
    localidad: { $in: localityIds },
    activo: true
  }).populate({
    path: 'localidad',
    populate: { path: 'zona' }
  });

  // Ordenar por nombre de localidad y luego por dirección
  clients.sort((a, b) => {
    const locA = a.localidad?.nombre || '';
    const locB = b.localidad?.nombre || '';
    const comp = locA.localeCompare(locB);
    if (comp !== 0) return comp;
    return (a.direccion || '').localeCompare(b.direccion || '');
  });

  return {
    zona: zone,
    totalClientesActivos: clients.length,
    clientes: clients
  };
};

module.exports = {
  getAllZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
  getHojaDeRuta
};
