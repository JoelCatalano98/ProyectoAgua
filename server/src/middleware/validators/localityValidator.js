const { z } = require('zod');
const { objectIdSchema, rejectEmptyBody } = require('./commonValidators');

const createLocalitySchema = z
  .object({
    nombre: z
      .string({ required_error: 'El nombre de la localidad es requerido', invalid_type_error: 'El nombre debe ser texto' })
      .trim()
      .min(1, 'El nombre no puede estar vacío')
      .max(100, 'El nombre no puede superar los 100 caracteres'),
    provincia: z
      .string({ invalid_type_error: 'La provincia debe ser texto' })
      .trim()
      .min(1, 'La provincia no puede estar vacía')
      .max(100, 'La provincia no puede superar los 100 caracteres')
      .default('Santa Fe'),
    zona: objectIdSchema
  })
  .strip();

const updateLocalitySchema = rejectEmptyBody(
  z
    .object({
      nombre: z
        .string({ invalid_type_error: 'El nombre debe ser texto' })
        .trim()
        .min(1, 'El nombre no puede estar vacío')
        .max(100, 'El nombre no puede superar los 100 caracteres')
        .optional(),
      provincia: z
        .string({ invalid_type_error: 'La provincia debe ser texto' })
        .trim()
        .min(1, 'La provincia no puede estar vacía')
        .max(100, 'La provincia no puede superar los 100 caracteres')
        .optional(),
      zona: objectIdSchema.optional()
    })
    .strip()
);

const localityQuerySchema = z
  .object({
    zona: objectIdSchema.optional()
  })
  .strip();

module.exports = {
  createLocalitySchema,
  updateLocalitySchema,
  localityQuerySchema
};
