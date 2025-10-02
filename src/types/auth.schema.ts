import { z } from 'zod';
import type {
  LoginRequestDto,
  RefreshTokenRequestDto,
  LoginResponseDto,
} from '@/dtos/auth.dto';

// 로그인 요청 스키마
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
}) satisfies z.ZodType<LoginRequestDto>;

// 토큰 재발급 요청 스키마
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
}) satisfies z.ZodType<RefreshTokenRequestDto>;

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
}) satisfies z.ZodType<LoginResponseDto>;
