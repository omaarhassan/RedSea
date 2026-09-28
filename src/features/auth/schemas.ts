import { z } from 'zod';
import { LanguageCode } from '../../types';

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, { message: 'auth.validation.nameMin' })
      .max(100, { message: 'auth.validation.nameMax' }),
    email: z
      .string()
      .trim()
      .min(1, { message: 'auth.validation.emailRequired' })
      .email({ message: 'auth.validation.emailInvalid' }),
    phone: z
      .string()
      .trim()
      .min(8, { message: 'auth.validation.phoneInvalid' })
      .regex(/^[+0-9\s\-()]{8,20}$/, { message: 'auth.validation.phoneInvalid' }),
    password: z
      .string()
      .min(6, { message: 'auth.validation.passwordMin' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'auth.validation.confirmPasswordRequired' }),
    cityId: z
      .string()
      .min(1, { message: 'auth.validation.cityRequired' }),
    preferredLanguage: z.enum(['en', 'ar', 'zh']),
    termsAccepted: z
      .boolean()
      .refine((val) => val === true, {
        message: 'auth.validation.termsRequired',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.validation.passwordsDontMatch',
    path: ['confirmPassword'],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'auth.validation.emailRequired' })
    .email({ message: 'auth.validation.emailInvalid' }),
  password: z
    .string()
    .min(1, { message: 'auth.validation.passwordRequired' }),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'auth.validation.emailRequired' })
    .email({ message: 'auth.validation.emailInvalid' }),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: 'auth.validation.nameMin' }),
  phone: z
    .string()
    .trim()
    .min(8, { message: 'auth.validation.phoneInvalid' }),
  cityId: z
    .string()
    .min(1, { message: 'auth.validation.cityRequired' }),
  addressText: z.string().optional(),
  preferredLanguage: z.enum(['en', 'ar', 'zh']),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
