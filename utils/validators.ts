import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export const registerSchema = z.object({
  username:  z.string().min(3, 'Mínimo 3 caracteres'),
  email:     z.string().email('Email inválido'),
  password:  z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
  confirmar: z.string(),
}).refine(d => d.password === d.confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar'],
});

export const mfaSchema = z.object({
  code: z.string().length(6, 'El código debe tener 6 dígitos').regex(/^\d+$/, 'Solo dígitos'),
});

export type LoginFormData    = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type MfaFormData      = z.infer<typeof mfaSchema>;
