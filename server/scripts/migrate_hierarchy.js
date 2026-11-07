const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { validateDevUri, backupDevDatabase } = require('./backup_dev');

const migrateHierarchy = async (customUri = null) => {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/distribuidora_agua';
  const { dbName } = validateDevUri(uri);

  console.log(`[Migración] Iniciando proceso de migración sobre la base de datos '${dbName}'...`);

  // Paso 1: Backup obligatorio previo
  const { backupDir } = await backupDevDatabase(uri);
  console.log(`[Migración] Backup de seguridad verificado en: ${backupDir}`);

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const zonesCol = db.collection('zones');
  const localitiesCol = db.collection('localities');
  const clientsCol = db.collection('clients');

  // Paso 2: Obtener datos existentes
  const localities = await localitiesCol.find().toArray();
  const zones = await zonesCol.find().toArray();
  const clients = await clientsCol.find().toArray();

  console.log(`[Migración] Estado actual: ${localities.length} localidades, ${zones.length} zonas, ${clients.length} clientes`);

  const locSantaFe = localities.find((l) => l.nombre === 'Santa Fe Capital');
  const locSantoTome = localities.find((l) => l.nombre === 'Santo Tomé');
  const locRincon = localities.find((l) => l.nombre === 'Rincón');
  const locRecreo = localities.find((l) => l.nombre === 'Recreo');

  if (!locSantaFe) {
    throw new Error("No se encontró la localidad 'Santa Fe Capital' en los datos a migrar.");
  }

  // Paso 3: Asignar localidad a las zonas existentes de Santa Fe Capital
  const zonaCentro = zones.find((z) => z.nombre === 'Zona Centro y Puerto');
  const zonaNorte = zones.find((z) => z.nombre === 'Zona Norte y Boulevard');

  if (zonaCentro) {
    await zonesCol.updateOne(
      { _id: zonaCentro._id },
      { $set: { localidad: locSantaFe._id } }
    );
    console.log(`[Migración] Zona 'Zona Centro y Puerto' asignada a 'Santa Fe Capital'`);
  }

  if (zonaNorte) {
    await zonesCol.updateOne(
      { _id: zonaNorte._id },
      { $set: { localidad: locSantaFe._id } }
    );
    console.log(`[Migración] Zona 'Zona Norte y Boulevard' asignada a 'Santa Fe Capital'`);
  }

  // Crear zonas para las otras localidades si no existen aún
  const ensureZone = async (nombre, localidadId, diasDeReparto) => {
    let existing = await zonesCol.findOne({ nombre, localidad: localidadId });
    if (!existing) {
      const res = await zonesCol.insertOne({
        nombre,
        localidad: localidadId,
        diasDeReparto,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      existing = { _id: res.insertedId, nombre, localidad: localidadId };
      console.log(`[Migración] Creada nueva zona '${nombre}' para localidad ${localidadId}`);
    }
    return existing;
  };

  const zonaSantoTome = locSantoTome
    ? await ensureZone('Zona Centro', locSantoTome._id, ['Lunes', 'Miércoles'])
    : null;
  const zonaRincon = locRincon
    ? await ensureZone('Zona Ruta 1', locRincon._id, ['Sábado'])
    : null;
  const zonaRecreo = locRecreo
    ? await ensureZone('Zona Casco Urbano', locRecreo._id, ['Martes', 'Jueves'])
    : null;

  // Paso 4: Migrar clientes (asignar zona correspondiente y remover localidad)
  for (const client of clients) {
    let targetZoneId = null;

    if (client.zona) {
      // Ya tiene zona asignada
      targetZoneId = client.zona;
    } else if (client.localidad) {
      const locIdStr = client.localidad.toString();
      if (locSantaFe && locIdStr === locSantaFe._id.toString()) {
        // En Santa Fe Capital distribuimos por dirección
        if (client.direccion && client.direccion.toLowerCase().includes('urquiza')) {
          targetZoneId = zonaNorte?._id || zonaCentro?._id;
        } else {
          targetZoneId = zonaCentro?._id || zonaNorte?._id;
        }
      } else if (locSantoTome && locIdStr === locSantoTome._id.toString()) {
        targetZoneId = zonaSantoTome?._id;
      } else if (locRincon && locIdStr === locRincon._id.toString()) {
        targetZoneId = zonaRincon?._id;
      } else if (locRecreo && locIdStr === locRecreo._id.toString()) {
        targetZoneId = zonaRecreo?._id;
      }
    }

    if (!targetZoneId) {
      targetZoneId = zonaCentro?._id;
    }

    await clientsCol.updateOne(
      { _id: client._id },
      {
        $set: { zona: targetZoneId },
        $unset: { localidad: '' }
      }
    );
    console.log(`[Migración] Cliente '${client.nombre}' actualizado con zona: ${targetZoneId}`);
  }

  // Paso 5: Remover campo zona de las localidades
  const locUpdateRes = await localitiesCol.updateMany({}, { $unset: { zona: '' } });
  console.log(`[Migración] Campo 'zona' removido de ${locUpdateRes.modifiedCount} localidades`);

  // Paso 6: Ajustar índices en colección zones
  try {
    await zonesCol.dropIndex('nombre_1');
    console.log(`[Migración] Índice único anterior 'nombre_1' eliminado de zones`);
  } catch (err) {
    // Si no existía, ignorar
  }
  await zonesCol.createIndex({ localidad: 1, nombre: 1 }, { unique: true });
  console.log(`[Migración] Índice compuesto { localidad: 1, nombre: 1 } creado en zones`);

  console.log(`[Migración] ¡Migración de jerarquía completada con éxito!`);
  await mongoose.disconnect();
};

if (require.main === module) {
  migrateHierarchy()
    .then(() => {
      console.log('Proceso de migración finalizado exitosamente.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Migración Error]:', err);
      process.exit(1);
    });
}

module.exports = migrateHierarchy;
