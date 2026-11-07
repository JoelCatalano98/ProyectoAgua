const rateLimit = require('express-rate-limit');

/**
 * Limitador de tasa de peticiones para intentos de autenticación.
 * 10 intentos cada 15 minutos por dirección IP.
 * Se desactiva automáticamente en entorno de pruebas (NODE_ENV === 'test').
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      ok: false,
      message: 'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 15 minutos.'
    });
  }
});

const loginRateLimiter = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  return limiter(req, res, next);
};

module.exports = loginRateLimiter;
