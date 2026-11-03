/**
 * Middleware genérico para validación de datos con Zod.
 * Reemplaza req[target] por el resultado parseado y limpio.
 *
 * @param {import('zod').ZodSchema} schema - Esquema de Zod.
 * @param {'body' | 'params' | 'query'} [target='body'] - Propiedad de req a validar.
 */
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[target]);
      req[target] = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validate;
