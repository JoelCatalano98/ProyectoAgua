const INSECURE_JWT_SECRETS = [
  'tu_clave_secreta_jwt_aqui',
  'tu_clave_secreta_aqui',
  'secret_fallback_key',
  'clave-secreta-de-ejemplo-cambiala',
  'supersecretjwtkey_utn_proyecto_2026',
  'secret',
  'jwt_secret',
  'changeme'
];

/**
 * Valida la presencia y robustez de las variables de entorno críticas.
 * @param {object} env - Objeto de variables de entorno (por defecto process.env)
 */
const validateEnv = (env = process.env) => {
  const jwtSecret = env.JWT_SECRET ? env.JWT_SECRET.trim() : '';

  if (!jwtSecret) {
    const errorMsg = 'FATAL: La variable de entorno JWT_SECRET es obligatoria y no está configurada.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Validación estricta exclusiva para entorno productivo
  if (env.NODE_ENV === 'production') {
    const isExample = INSECURE_JWT_SECRETS.includes(jwtSecret.toLowerCase());
    const isTooShort = jwtSecret.length < 32;

    if (isExample || isTooShort) {
      const errorMsg =
        'FATAL: En entorno de producción (NODE_ENV=production), JWT_SECRET no puede ser un valor de ejemplo y debe contener al menos 32 caracteres por razones de seguridad.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }
};

module.exports = {
  validateEnv,
  INSECURE_JWT_SECRETS
};
