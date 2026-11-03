const mongoose = require('mongoose');

let cachedPromise = null;

const connectDB = async () => {
  // Si ya hay una conexión activa establecida, reutilizarla
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Si ya existe una promesa de conexión en curso, devolverla
  if (cachedPromise) {
    return cachedPromise;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/distribuidora_agua';

  cachedPromise = mongoose
    .connect(uri)
    .then((conn) => {
      console.log(`MongoDB conectado exitosamente: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    })
    .catch((error) => {
      console.error(`Error al conectar con MongoDB: ${error.message}`);
      cachedPromise = null; // Limpiar cache ante fallo para permitir reintentar
      throw error;
    });

  return cachedPromise;
};

module.exports = connectDB;
