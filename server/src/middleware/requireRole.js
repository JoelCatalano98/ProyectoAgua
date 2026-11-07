/**
 * Middleware para autorizar acceso según roles de usuario.
 * Debe utilizarse después de verifyToken.
 * Devuelve 403 con el formato unificado { ok: false, message }.
 *
 * @param {...string} roles - Roles permitidos para acceder al recurso.
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({
        ok: false,
        message: 'Acceso denegado: permisos insuficientes'
      });
    }
    next();
  };
};

module.exports = requireRole;
