const { z } = require('zod');

// Validador de ObjectId de MongoDB (24 caracteres hexadecimales)
const objectIdSchema = z
  .string({ required_error: 'El ID es requerido', invalid_type_error: 'El ID debe ser una cadena de texto' })
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, {
    message: 'El identificador debe ser un ObjectId de MongoDB válido (24 caracteres hexadecimales)'
  });

// Validador común para parámetros de ruta :id
const idParamSchema = z.object({
  id: objectIdSchema
});

// Helper para rechazar cuerpos PUT/PATCH completamente vacíos
const rejectEmptyBody = (schema) =>
  schema.refine((data) => Object.keys(data).length > 0, {
    message: 'El cuerpo de la solicitud no puede estar vacío'
  });

module.exports = {
  objectIdSchema,
  idParamSchema,
  rejectEmptyBody
};
