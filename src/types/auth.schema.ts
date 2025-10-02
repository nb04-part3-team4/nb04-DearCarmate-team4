import { z } from 'zod';

// 로그인 요청 스키마
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// 토큰 재발급 요청 스키마
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// 로그인 응답 스키마
export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.number(),
    email: z.string(),
    name: z.string(),
    employeeNumber: z.string(),
    isAdmin: z.boolean(),
    companyId: z.number(),
  }),
});

// 타입 추론
export type LoginRequest = z.infer<typeof loginSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
