const mongoose = require('mongoose');

const validateTestDatabase = (uri) => {
  if (!uri || typeof uri !== 'string') {
    throw new Error('SEGURIDAD ABORTADA: URI de base de datos no proporcionada para tests.');
  }

  if (uri.startsWith('mongodb+srv://') || uri.includes('mongodb.net')) {
    throw new Error(
      'SEGURIDAD ABORTADA: La URI de base de datos para tests es de Atlas (mongodb+srv). Los tests solo deben ejecutarse sobre MongoDB local y NUNCA tocar Atlas.'
    );
  }

  const cleanPath = uri.split('?')[0].split('#')[0];
  const dbName = cleanPath.split('/').pop();

  if (!dbName || !dbName.endsWith('_test')) {
    throw new Error(
      `SEGURIDAD ABORTADA: El nombre de la base de datos de test ('${dbName}') debe terminar obligatoriamente en '_test' para proteger las bases de desarrollo y producción.`
    );
  }
};

const getTestUri = () => {
  return process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/distribuidora_agua_test';
};

const connectTestDB = async () => {
  const uri = getTestUri();
  validateTestDatabase(uri);

  if (mongoose.connection.readyState === 1) {
    validateTestDatabase(mongoose.connection.name + '_test' === mongoose.connection.name ? uri : `mongodb://localhost/${mongoose.connection.name}`);
    return mongoose.connection;
  }

  await mongoose.connect(uri);
  validateTestDatabase(`mongodb://localhost/${mongoose.connection.name}`);
  return mongoose.connection;
};

const clearDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    await connectTestDB();
  }

  // Doble chequeo de seguridad antes de cualquier eliminación
  const currentDb = mongoose.connection.name;
  if (!currentDb || !currentDb.endsWith('_test')) {
    throw new Error(
      `SEGURIDAD ABORTADA: Intento de limpiar una base de datos que no termina en '_test': '${currentDb}'`
    );
  }

  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

const disconnectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

module.exports = {
  validateTestDatabase,
  getTestUri,
  connectTestDB,
  clearDatabase,
  disconnectTestDB
};
