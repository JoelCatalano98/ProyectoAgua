const Locality = require('../models/localityModel');
const Zone = require('../models/zoneModel');
const Client = require('../models/clientModel');
const AppError = require('../utils/AppError');

const getAllLocalities = async () => {
  return Locality.find().sort({ nombre: 1 });
};

const getLocalityById = async (id) => {
  const locality = await Locality.findById(id);
  if (!locality) {
    throw new AppError('Localidad no encontrada', 404);
  }
  return locality;
};

const createLocality = async (data) => {
  if (!data.nombre || !data.nombre.trim()) {
    throw new AppError('El nombre de la localidad es requerido', 400, [
      { campo: 'nombre', mensaje: 'El nombre de la localidad es requerido' }
    ]);
  }
  return Locality.create(data);
};

const updateLocality = async (id, data) => {
  const locality = await Locality.findById(id);
  if (!locality) {
    throw new AppError('Localidad no encontrada', 404);
  }

  Object.assign(locality, data);
  await locality.save();
  return locality;
};

const deleteLocality = async (id) => {
  const locality = await Locality.findById(id);
  if (!locality) {
    throw new AppError('Localidad no encontrada', 404);
  }

  // Regla de negocio: No permitir borrar una Localidad con zonas
  const zoneCount = await Zone.countDocuments({ localidad: id });
  if (zoneCount > 0) {
    const pluralText = zoneCount === 1 ? '1 zona asociada' : `${zoneCount} zonas asociadas`;
    throw new AppError(
      `No se puede eliminar la localidad porque tiene ${pluralText}`,
      409
    );
  }

  await Locality.findByIdAndDelete(id);
  return { message: 'Localidad eliminada correctamente', id };
};

/**
 * Hoja de ruta para repartidores por localidad:
 * Devuelve la localidad con sus zonas y clientes activos ordenados por zona y dirección.
 */
const getHojaDeRutaByLocality = async (localityId) => {
  const locality = await Locality.findById(localityId);
  if (!locality) {
    throw new AppError('Localidad no encontrada', 404);
  }

  const zones = await Zone.find({ localidad: localityId }).sort({ nombre: 1 });
  const zoneIds = zones.map((z) => z._id);

  const clients = await Client.find({
    zona: { $in: zoneIds },
    activo: true
  }).sort({ direccion: 1 });

  const clientsByZone = new Map();
  zoneIds.forEach((id) => clientsByZone.set(id.toString(), []));

  clients.forEach((client) => {
    const zId = client.zona.toString();
    if (clientsByZone.has(zId)) {
      clientsByZone.get(zId).push(client);
    }
  });

  const zonasResult = zones.map((zone) => {
    const zoneClients = clientsByZone.get(zone._id.toString()) || [];
    // Ordenar clientes por dirección alfabéticamente (con soporte de acentos en español)
    zoneClients.sort((a, b) => (a.direccion || '').localeCompare(b.direccion || ''));

    return {
      _id: zone._id,
      nombre: zone.nombre,
      diasDeReparto: zone.diasDeReparto,
      cantidadClientes: zoneClients.length,
      clientes: zoneClients
    };
  });

  return {
    localidad: locality,
    cantidadZonas: zones.length,
    totalClientes: clients.length,
    zonas: zonasResult
  };
};

module.exports = {
  getAllLocalities,
  getLocalityById,
  createLocality,
  updateLocality,
  deleteLocality,
  getHojaDeRutaByLocality
};
