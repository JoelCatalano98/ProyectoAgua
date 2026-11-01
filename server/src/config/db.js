const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/distribuidora_agua';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB conectado exitosamente: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`Error al conectar con MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
