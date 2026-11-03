const { z } = require('zod');
const { rejectEmptyBody } = require('./commonValidators');

const createCategorySchema = z
  .object({
    nombre: z
      .string({ required_error: 'El nombre de la categoría es requerido', invalid_type_error: 'El nombre debe ser texto' })
      .trim()
      .min(1, 'El nombre no puede estar vacío')
      .max(100, 'El nombre no puede superar los 100 caracteres'),
    descripcion: z
      .string({ invalid_type_error: 'La descripción debe ser texto' })
      .trim()
      .max(500, 'La descripción no puede superar los 500 caracteres')
      .optional()
  })
  .strip();

const updateCategorySchema = rejectEmptyBody(
  z
    .object({
      nombre: z
        .string({ invalid_type_error: 'El nombre debe ser texto' })
        .trim()
        .min(1, 'El nombre no puede estar vacío')
        .max(100, 'El nombre no puede superar los 100 caracteres')
        .optional(),
      descripcion: z
        .string({ invalid_type_error: 'La descripción debe ser texto' })
        .trim()
        .max(500, 'La descripción no puede superar los 500 caracteres')
        .optional()
    })
    .strip()
);

module.exports = {
  createCategorySchema,
  updateCategorySchema
};
