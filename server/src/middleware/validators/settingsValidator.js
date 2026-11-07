const { z } = require('zod');

const updateSettingsSchema = z
  .object({
    nombreEmpresa: z
      .string({
        required_error: 'El nombre de la empresa es requerido',
        invalid_type_error: 'El nombre de la empresa debe ser texto'
      })
      .trim()
      .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
      .max(80, 'El nombre de la empresa no puede superar los 80 caracteres')
  })
  .strip();

module.exports = {
  updateSettingsSchema
};
