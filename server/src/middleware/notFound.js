/**
 * Middleware para capturar rutas inexistentes (404 Not Found).
 * Devuelve el formato unificado: { ok: false, message }
 */
const notFound = (req, res) => {
  res.status(404).json({
    ok: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
};

module.exports = notFound;
