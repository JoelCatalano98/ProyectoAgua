class AppError extends Error {
  constructor(message, statusCode = 400, detalles = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    if (detalles) {
      this.detalles = detalles;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
