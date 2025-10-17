import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const googleLoginSchema = z.object({
  token: z.string().min(1, 'Google token is required'),
  companyCode: z.string().optional(),
});

export const googleSignupSchema = z.object({
  token: z.string().min(1, 'Google token is required'),
  name: z.string().min(1, 'Name is required'),
  employeeNumber: z.string().min(1, 'Employee number is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  companyCode: z.string().min(1, 'Company code is required'),
});

export type LoginRequestDto = z.infer<typeof loginSchema>;
export type RefreshTokenRequestDto = z.infer<typeof refreshTokenSchema>;
export type GoogleLoginRequestDto = z.infer<typeof googleLoginSchema>;
export type GoogleSignupRequestDto = z.infer<typeof googleSignupSchema>;
