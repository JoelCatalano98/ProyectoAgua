const { z } = require('zod');

const registerUserSchema = z
  .object({
    nombre: z
      .string({ invalid_type_error: 'El nombre debe ser texto' })
      .trim()
      .max(100, 'El nombre no puede superar los 100 caracteres')
      .optional(),
    email: z
      .string({ required_error: 'El email es requerido', invalid_type_error: 'El email debe ser texto' })
      .trim()
      .email('Formato de correo electrónico inválido')
      .max(100, 'El email no puede superar los 100 caracteres'),
    password: z
      .string({ required_error: 'La contraseña es requerida', invalid_type_error: 'La contraseña debe ser texto' })
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(72, 'La contraseña no puede superar los 72 caracteres'),
    rol: z
      .enum(['admin', 'repartidor'], {
        errorMap: () => ({ message: "El rol solo puede ser 'admin' o 'repartidor'" })
      })
      .default('repartidor')
  })
  .strip();

const loginUserSchema = z
  .object({
    email: z
      .string({ required_error: 'El email es requerido', invalid_type_error: 'El email debe ser texto' })
      .trim()
      .email('Formato de correo electrónico inválido')
      .max(100, 'El email no puede superar los 100 caracteres'),
    password: z
      .string({ required_error: 'La contraseña es requerida', invalid_type_error: 'La contraseña debe ser texto' })
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(72, 'La contraseña no puede superar los 72 caracteres')
  })
  .strip();

module.exports = {
  registerUserSchema,
  loginUserSchema
};
