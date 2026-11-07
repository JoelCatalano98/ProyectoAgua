const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

function validateDevUri(uri) {
  if (!uri) {
    throw new Error('URI de conexión no provista.');
  }
  if (uri.startsWith('mongodb+srv://') || uri.includes('mongodb.net')) {
    throw new Error('ABORTADO POR SEGURIDAD: No se permite operar sobre instancias de MongoDB Atlas / producción.');
  }
  const dbNameMatch = uri.match(/\/([^/?]+)(?:\?|$)/);
  const dbName = dbNameMatch ? dbNameMatch[1] : '';
  if (!dbName) {
    throw new Error('ABORTADO: No se pudo determinar el nombre de la base de datos en la URI.');
  }
  if (dbName.endsWith('_test')) {
    throw new Error(`ABORTADO POR SEGURIDAD: La base de datos es de test ('${dbName}').`);
  }
  if (dbName !== 'distribuidora_agua') {
    throw new Error(`ABORTADO: La base de datos esperada es 'distribuidora_agua', pero se recibió '${dbName}'.`);
  }
  return { dbName, uri };
}

const backupDevDatabase = async (customUri = null) => {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/distribuidora_agua';
  const { dbName } = validateDevUri(uri);

  console.log(`[Backup] Iniciando backup de la base '${dbName}'...`);
  const isConnectedBefore = mongoose.connection.readyState === 1;
  if (!isConnectedBefore) {
    await mongoose.connect(uri);
  }

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, `../backups/backup_dev_${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const summary = {};
  for (const col of collections) {
    const docs = await db.collection(col.name).find().toArray();
    const filePath = path.join(backupDir, `${col.name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf-8');
    summary[col.name] = docs.length;
    console.log(`[Backup] Colección '${col.name}': ${docs.length} documentos exportados a ${filePath}`);
  }

  console.log(`[Backup] Backup completado con éxito en: ${backupDir}`);

  if (!isConnectedBefore) {
    await mongoose.disconnect();
  }

  return { backupDir, summary };
};

if (require.main === module) {
  backupDevDatabase()
    .then(({ backupDir, summary }) => {
      console.log('Resumen:', summary);
      console.log('Ruta de backup:', backupDir);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Backup Error]:', err.message);
      process.exit(1);
    });
}

module.exports = {
  validateDevUri,
  backupDevDatabase
};
