const { ZodError } = require('zod');
const AppError = require('../utils/AppError');

/**
 * Middleware central de manejo de errores.
 * Unifica todas las respuestas bajo el formato:
 * { ok: false, message, detalles?: [{ campo, mensaje }] }
 */
const errorHandler = (err, req, res, next) => {
  // 1. JSON mal formado en el body (SyntaxError de express.json)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      ok: false,
      message: 'JSON mal formado en el cuerpo de la petición'
    });
  }

  // 2. Errores de validación de Zod
  if (err instanceof ZodError) {
    const detalles = err.issues.map((issue) => ({
      campo: issue.path.join('.') || 'body',
      mensaje: issue.message
    }));
    return res.status(400).json({
      ok: false,
      message: 'Error de validación en los datos enviados',
      detalles
    });
  }

  // 3. Errores operacionales explícitos (AppError)
  if (err instanceof AppError || err.isOperational) {
    const response = {
      ok: false,
      message: err.message
    };
    if (err.detalles && Array.isArray(err.detalles) && err.detalles.length > 0) {
      response.detalles = err.detalles;
    }
    return res.status(err.statusCode || 400).json(response);
  }

  // 4. Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    const detalles = Object.values(err.errors || {}).map((e) => ({
      campo: e.path,
      mensaje: e.message
    }));
    return res.status(400).json({
      ok: false,
      message: 'Error de validación en la base de datos',
      detalles
    });
  }

  // 5. CastError de Mongoose (ObjectId inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      ok: false,
      message: `Identificador o formato de dato inválido en el campo '${err.path}'`
    });
  }

  // 6. Código 11000 de MongoDB (índice único duplicado) -> 409 Conflict
  if (err.code === 11000) {
    let message = 'Ya existe un registro con esos datos únicos';
    const keys = Object.keys(err.keyValue || {});
    if (keys.length > 0) {
      const field = keys[0];
      const val = err.keyValue[field];
      const coll = err.collectionName || (err.message || '');
      if (coll.includes('categories')) {
        message = 'Ya existe una categoría con ese nombre';
      } else if (coll.includes('zones')) {
        message = 'Ya existe una zona con ese nombre';
      } else if (coll.includes('users')) {
        message = 'El correo electrónico ya se encuentra registrado';
      } else {
        message = `Ya existe un registro con el valor '${val}' en el campo '${field}'`;
      }
    }
    return res.status(409).json({
      ok: false,
      message
    });
  }

  // 7. Errores de autenticación JWT
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      ok: false,
      message: 'Token expirado'
    });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      ok: false,
      message: 'Token inválido'
    });
  }

  // 8. Error no controlado (500 Internal Server Error)
  // El detalle solo se loguea en consola, nunca se expone al cliente
  console.error('[Error 500 no controlado]:', err);
  return res.status(500).json({
    ok: false,
    message: 'Error interno del servidor'
  });
};

module.exports = errorHandler;
