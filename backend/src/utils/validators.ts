import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất một chữ hoa')
  .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất một chữ thường')
  .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất một số')
  .regex(/[^\w\s]/, 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt');

export const emailSchema = z
  .string()
  .email('Định dạng email không hợp lệ')
  .toLowerCase()
  .trim();

export const nameSchema = z
  .string()
  .min(2, 'Tên phải có ít nhất 2 ký tự')
  .max(50, 'Tên không được vượt quá 50 ký tự')
  .regex(/^[\p{L}\s-]+$/u, 'Tên chỉ được chứa chữ cái, dấu cách và dấu gạch ngang')
  .trim();

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token không hợp lệ'),
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token không hợp lệ'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token không hợp lệ'),
});
