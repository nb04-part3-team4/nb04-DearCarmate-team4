import { z } from 'zod';
import type { LoginRequestDto, RefreshTokenRequestDto } from '@/dtos/auth.dto';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
}) satisfies z.ZodType<LoginRequestDto>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
}) satisfies z.ZodType<RefreshTokenRequestDto>;
