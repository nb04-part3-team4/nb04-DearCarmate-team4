import { z } from 'zod';

export const signupSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    employeeNumber: z.string().min(1, 'Employee number is required'),
    phoneNumber: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    passwordConfirmation: z
      .string()
      .min(1, 'Password confirmation is required'),
    companyName: z.string().min(1, 'Company is required'),
    companyCode: z.string().min(1, 'Company code is required'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: '비밀번호와 비밀번호 확인이 일치하지 않습니다',
    path: ['passwordConfirmation'],
  });

export const updateMeSchema = z
  .object({
    employeeNumber: z.string().optional(),
    phoneNumber: z.string().optional(),
    currentPassword: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .optional(),
    passwordConfirmation: z.string().optional(),
    imageUrl: z.string().url().optional(),
  })
  .refine(
    (data) => {
      if (data.password && !data.passwordConfirmation) return false;
      if (data.password && data.password !== data.passwordConfirmation)
        return false;
      return true;
    },
    {
      message: '비밀번호와 비밀번호 확인이 일치하지 않습니다',
      path: ['passwordConfirmation'],
    },
  )
  .refine(
    (data) => {
      if (data.password && !data.currentPassword) return false;
      return true;
    },
    {
      message: '현재 비밀번호가 필요합니다',
      path: ['currentPassword'],
    },
  );

export type SignupInput = z.infer<typeof signupSchema>;
export type UpdateMeInput = z.infer<typeof updateMeSchema>;
