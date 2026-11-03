const { z } = require('zod');
const { rejectEmptyBody } = require('./commonValidators');

const diaEnum = z.enum(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'], {
  errorMap: () => ({
    message: 'Día de reparto inválido. Valores permitidos: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado'
  })
});

const createZoneSchema = z
  .object({
    nombre: z
      .string({ required_error: 'El nombre de la zona es requerido', invalid_type_error: 'El nombre debe ser texto' })
      .trim()
      .min(1, 'El nombre no puede estar vacío')
      .max(100, 'El nombre no puede superar los 100 caracteres'),
    diasDeReparto: z
      .array(diaEnum, { invalid_type_error: 'Los días de reparto deben ser un arreglo de cadenas válidas' })
      .optional()
      .default([])
      .refine((items) => !items || new Set(items).size === items.length, {
        message: 'No se permiten días de reparto duplicados'
      })
  })
  .strip();

const updateZoneSchema = rejectEmptyBody(
  z
    .object({
      nombre: z
        .string({ invalid_type_error: 'El nombre debe ser texto' })
        .trim()
        .min(1, 'El nombre no puede estar vacío')
        .max(100, 'El nombre no puede superar los 100 caracteres')
        .optional(),
      diasDeReparto: z
        .array(diaEnum, { invalid_type_error: 'Los días de reparto deben ser un arreglo de cadenas válidas' })
        .optional()
        .refine((items) => !items || new Set(items).size === items.length, {
          message: 'No se permiten días de reparto duplicados'
        })
    })
    .strip()
);

module.exports = {
  createZoneSchema,
  updateZoneSchema
};
