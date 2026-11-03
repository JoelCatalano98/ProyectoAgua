const { z } = require('zod');
const { objectIdSchema, rejectEmptyBody } = require('./commonValidators');

const createProductSchema = z
  .object({
    nombre: z
      .string({ required_error: 'El nombre del producto es requerido', invalid_type_error: 'El nombre debe ser texto' })
      .trim()
      .min(1, 'El nombre no puede estar vacío')
      .max(150, 'El nombre no puede superar los 150 caracteres'),
    categoria: objectIdSchema,
    precio: z.coerce
      .number({ required_error: 'El precio es requerido', invalid_type_error: 'El precio debe ser un número' })
      .min(0, 'El precio no puede ser negativo'),
    stock: z.coerce
      .number({ invalid_type_error: 'El stock debe ser un número' })
      .int('El stock debe ser un número entero')
      .min(0, 'El stock no puede ser negativo')
      .default(0),
    descripcion: z
      .string({ invalid_type_error: 'La descripción debe ser texto' })
      .trim()
      .max(500, 'La descripción no puede superar los 500 caracteres')
      .optional()
  })
  .strip();

const updateProductSchema = rejectEmptyBody(
  z
    .object({
      nombre: z
        .string({ invalid_type_error: 'El nombre debe ser texto' })
        .trim()
        .min(1, 'El nombre no puede estar vacío')
        .max(150, 'El nombre no puede superar los 150 caracteres')
        .optional(),
      categoria: objectIdSchema.optional(),
      precio: z.coerce
        .number({ invalid_type_error: 'El precio debe ser un número' })
        .min(0, 'El precio no puede ser negativo')
        .optional(),
      stock: z.coerce
        .number({ invalid_type_error: 'El stock debe ser un número' })
        .int('El stock debe ser un número entero')
        .min(0, 'El stock no puede ser negativo')
        .optional(),
      descripcion: z
        .string({ invalid_type_error: 'La descripción debe ser texto' })
        .trim()
        .max(500, 'La descripción no puede superar los 500 caracteres')
        .optional()
    })
    .strip()
);

const productQuerySchema = z
  .object({
    categoria: objectIdSchema.optional()
  })
  .strip();

module.exports = {
  createProductSchema,
  updateProductSchema,
  productQuerySchema
};
