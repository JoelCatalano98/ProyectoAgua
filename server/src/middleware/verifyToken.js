const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar JWT en encabezado Authorization Bearer.
 * Devuelve 401 con mensajes descriptivos ante token ausente, invalido o expirado.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Token no proporcionado',
      error: 'Token no proporcionado'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Token inválido',
      error: 'Token inválido'
    });
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET || 'secret_fallback_key';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Token expirado',
        error: 'Token expirado'
      });
    }

    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Token inválido',
      error: 'Token inválido'
    });
  }
};

module.exports = verifyToken;
