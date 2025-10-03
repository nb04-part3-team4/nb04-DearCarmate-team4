import { z } from 'zod';
import type { SignupRequestDto, UpdateMeRequestDto } from '@/dtos/user.dto';

// 회원가입 요청 스키마
export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  employeeNumber: z.string().min(1, 'Employee number is required'),
  phoneNumber: z.string().optional(),
  companyCode: z.string().min(1, 'Company code is required'),
  imageUrl: z.string().url().optional(),
}) satisfies z.ZodType<SignupRequestDto>;

// 내 정보 수정 요청 스키마
export const updateMeSchema = z.object({
  password: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .optional(),
  name: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  imageUrl: z.string().url().optional(),
}) satisfies z.ZodType<UpdateMeRequestDto>;
