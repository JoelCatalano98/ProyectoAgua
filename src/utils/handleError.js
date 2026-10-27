const AppError = require('./AppError');

/**
 * Traduce errores de aplicacion, Mongoose y de sistema a respuestas HTTP estandarizadas.
 * Codigos manejados: 400, 401, 404, 500.
 */
const handleError = (err, res) => {
  // Errores operacionales explicitos
  if (err instanceof AppError || err.isOperational) {
    return res.status(err.statusCode || 400).json({
      status: 'error',
      statusCode: err.statusCode || 400,
      message: err.message,
      error: err.message
    });
  }

  // Error de validacion de Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    const message = `Error de validación: ${messages.join('. ')}`;
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message,
      error: message,
      details: messages
    });
  }

  // Error de conversion de ObjectId o tipo invalido de Mongoose
  if (err.name === 'CastError') {
    const message = `Identificador o formato de dato inválido en el campo '${err.path}'`;
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message,
      error: message
    });
  }

  // Error de indice unico duplicado en MongoDB (E11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    const message = fields.length > 0
      ? `Ya existe un registro con el valor '${err.keyValue[fields[0]]}' en el campo '${fields[0]}'`
      : 'Ya existe un registro con esos datos únicos';
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message,
      error: message
    });
  }

  // Errores JWT no capturados previamente
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Token inválido',
      error: 'Token inválido'
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Token expirado',
      error: 'Token expirado'
    });
  }

  // Error generico no controlado
  console.error('Unhandled Server Error:', err);
  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Error interno del servidor',
    error: err.message || 'Error interno del servidor'
  });
};

module.exports = handleError;
