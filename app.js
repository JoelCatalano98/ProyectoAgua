require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./src/config/db');

// Importacion de rutas
const productRoute = require('./src/routes/productRoute');
const categoryRoute = require('./src/routes/categoryRoute');
const zoneRoute = require('./src/routes/zoneRoute');
const localityRoute = require('./src/routes/localityRoute');
const clientRoute = require('./src/routes/clientRoute');
const userRoute = require('./src/routes/userRoute');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Handler para JSON mal formado (400)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'JSON mal formado en el cuerpo de la petición',
      error: 'JSON mal formado en el cuerpo de la petición'
    });
  }
  next(err);
});

// Ruta base informativa
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API RESTful Distribuidora de Agua - Proyecto Final UTN BA',
    version: '1.0.0'
  });
});

// Montaje de rutas
app.use('/api/products', productRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/zones', zoneRoute);
app.use('/api/localities', localityRoute);
app.use('/api/clients', clientRoute);
app.use('/api/users', userRoute);

// Handler 404 para rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Manejador de error general de express
app.use((err, req, res, next) => {
  console.error('Error no controlado en la app:', err);
  res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Error interno del servidor',
    error: err.message || 'Error interno del servidor'
  });
});

// Levantar servidor solo si es ejecutado directamente
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Servidor iniciado y escuchando en el puerto ${PORT}`);
      });
    })
    .catch((err) => {
      console.warn(`[Aviso DB] No se pudo conectar inmediatamente a MongoDB (${err.message}).`);
      console.warn(`Iniciando servidor HTTP de todos modos para endpoints y validaciones...`);
      app.listen(PORT, () => {
        console.log(`Servidor iniciado en modo contingencia en el puerto ${PORT}`);
      });
    });
}

module.exports = app;
