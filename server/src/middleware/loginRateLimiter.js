const rateLimit = require('express-rate-limit');

/**
 * Limitador de tasa de peticiones para intentos de autenticación.
 * 10 intentos cada 15 minutos por dirección IP.
 */
const loginRateLimiter = rateLimit({
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

module.exports = loginRateLimiter;
