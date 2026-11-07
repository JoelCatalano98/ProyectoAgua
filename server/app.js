const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
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
const settingsRoute = require('./src/routes/settingsRoute');

// Importación de middlewares de error
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');
const AppError = require('./src/utils/AppError');

const app = express();

// Habilitar trust proxy para reverse proxies (Vercel / AWS Lambda) y express-rate-limit
app.set('trust proxy', 1);

// Configuración dinámica de CORS vía CLIENT_URL
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim()).filter(Boolean)
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (curl, Postman, llamadas directas o scripts)
    if (!origin) {
      return callback(null, true);
    }

    // Si CLIENT_URL está configurada, validar explícitamente contra la lista
    if (allowedOrigins.length > 0) {
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new AppError('No permitido por CORS', 403));
    }

    // En desarrollo (sin CLIENT_URL definida), permitir localhost en cualquier puerto
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (isLocalhost || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new AppError('No permitido por CORS', 403));
  },
  credentials: true
};

// Middlewares globales
app.use(cors(corsOptions));
app.use(express.json());

// Conexión a base de datos bajo demanda para entornos serverless
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta base informativa
app.get(['/', '/api'], (req, res) => {
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
app.use('/api/settings', settingsRoute);

// Middleware 404 para rutas inexistentes
app.use(notFound);

// Middleware central de manejo de errores
app.use(errorHandler);

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
