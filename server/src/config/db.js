const mongoose = require('mongoose');

let cachedPromise = null;

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

const connectDB = async () => {
  // Si ya hay una conexión activa establecida, reutilizarla
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Si ya existe una promesa de conexión en curso, devolverla
  if (cachedPromise) {
    return cachedPromise;
  }

  let uri;
  if (process.env.NODE_ENV === 'test') {
    uri = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/distribuidora_agua_test';
    validateTestDatabase(uri);
  } else {
    uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/distribuidora_agua';
  }

  cachedPromise = mongoose
    .connect(uri)
    .then((conn) => {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`MongoDB conectado exitosamente: ${conn.connection.host}/${conn.connection.name}`);
      }
      return conn;
    })
    .catch((error) => {
      if (process.env.NODE_ENV !== 'test') {
        console.error(`Error al conectar con MongoDB: ${error.message}`);
      }
      cachedPromise = null; // Limpiar cache ante fallo para permitir reintentar
      throw error;
    });

  return cachedPromise;
};

module.exports = connectDB;
