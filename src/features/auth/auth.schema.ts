import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ message: '이메일을 입력해주세요' })
    .min(1, '이메일을 입력해주세요')
    .email({ message: '올바른 이메일 형식이 아닙니다' }),
  password: z
    .string({ message: '비밀번호를 입력해주세요' })
    .min(1, '비밀번호를 입력해주세요'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, '리프레시 토큰이 필요합니다'),
});

export const googleLoginSchema = z.object({
  token: z.string().min(1, 'Google 토큰이 필요합니다'),
  companyCode: z.string().optional(),
});

export const googleSignupSchema = z.object({
  token: z.string().min(1, 'Google 토큰이 필요합니다'),
  name: z.string().min(1, '이름을 입력해주세요'),
  employeeNumber: z.string().min(1, '사원번호를 입력해주세요'),
  phoneNumber: z.string().min(1, '전화번호를 입력해주세요'),
  companyCode: z.string().min(1, '기업 인증코드를 입력해주세요'),
});

export type LoginRequestDto = z.infer<typeof loginSchema>;
export type RefreshTokenRequestDto = z.infer<typeof refreshTokenSchema>;
export type GoogleLoginRequestDto = z.infer<typeof googleLoginSchema>;
export type GoogleSignupRequestDto = z.infer<typeof googleSignupSchema>;
