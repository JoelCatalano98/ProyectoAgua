const { z } = require('zod');
const { objectIdSchema, rejectEmptyBody } = require('./commonValidators');

const createClientSchema = z
  .object({
    nombre: z
      .string({ required_error: 'El nombre del cliente es requerido', invalid_type_error: 'El nombre debe ser texto' })
      .trim()
      .min(1, 'El nombre no puede estar vacío')
      .max(150, 'El nombre no puede superar los 150 caracteres'),
    telefono: z
      .string({ invalid_type_error: 'El teléfono debe ser texto' })
      .trim()
      .max(50, 'El teléfono no puede superar los 50 caracteres')
      .optional(),
    direccion: z
      .string({ required_error: 'La dirección es requerida', invalid_type_error: 'La dirección debe ser texto' })
      .trim()
      .min(1, 'La dirección no puede estar vacía')
      .max(200, 'La dirección no puede superar los 200 caracteres'),
    localidad: objectIdSchema,
    envasesEnPoder: z.coerce
      .number({ invalid_type_error: 'Los envases en poder deben ser un número' })
      .int('Los envases en poder deben ser un número entero')
      .min(0, 'Los envases en poder no pueden ser negativos')
      .default(0),
    saldo: z.coerce
      .number({ invalid_type_error: 'El saldo debe ser un número' })
      .default(0),
    activo: z.coerce.boolean().default(true),
    observaciones: z
      .string({ invalid_type_error: 'Las observaciones deben ser texto' })
      .trim()
      .max(500, 'Las observaciones no pueden superar los 500 caracteres')
      .optional()
  })
  .strip();

const updateClientSchema = rejectEmptyBody(
  z
    .object({
      nombre: z
        .string({ invalid_type_error: 'El nombre debe ser texto' })
        .trim()
        .min(1, 'El nombre no puede estar vacío')
        .max(150, 'El nombre no puede superar los 150 caracteres')
        .optional(),
      telefono: z
        .string({ invalid_type_error: 'El teléfono debe ser texto' })
        .trim()
        .max(50, 'El teléfono no puede superar los 50 caracteres')
        .optional(),
      direccion: z
        .string({ invalid_type_error: 'La dirección debe ser texto' })
        .trim()
        .min(1, 'La dirección no puede estar vacía')
        .max(200, 'La dirección no puede superar los 200 caracteres')
        .optional(),
      localidad: objectIdSchema.optional(),
      envasesEnPoder: z.coerce
        .number({ invalid_type_error: 'Los envases en poder deben ser un número' })
        .int('Los envases en poder deben ser un número entero')
        .min(0, 'Los envases en poder no pueden ser negativos')
        .optional(),
      saldo: z.coerce
        .number({ invalid_type_error: 'El saldo debe ser un número' })
        .optional(),
      activo: z.coerce.boolean().optional(),
      observaciones: z
        .string({ invalid_type_error: 'Las observaciones deben ser texto' })
        .trim()
        .max(500, 'Las observaciones no pueden superar los 500 caracteres')
        .optional()
    })
    .strip()
);

const clientQuerySchema = z
  .object({
    activo: z
      .enum(['true', 'false'], {
        errorMap: () => ({ message: "El filtro 'activo' solo acepta 'true' o 'false'" })
      })
      .optional(),
    zona: objectIdSchema.optional(),
    localidad: objectIdSchema.optional()
  })
  .strip();

module.exports = {
  createClientSchema,
  updateClientSchema,
  clientQuerySchema
};
