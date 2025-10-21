import { z } from 'zod';

export const signupSchema = z
  .object({
    name: z.string().min(1, '이름을 입력해주세요'),
    email: z.string().email('올바른 이메일 형식이 아닙니다'),
    employeeNumber: z.string().min(1, '사원번호를 입력해주세요'),
    phoneNumber: z.string().optional(),
    password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
    passwordConfirmation: z.string().min(1, '비밀번호 확인을 입력해주세요'),
    companyName: z.string().min(1, '회사명을 입력해주세요'),
    companyCode: z.string().min(1, '기업 인증코드를 입력해주세요'),
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
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
      .optional(),
    passwordConfirmation: z.string().optional(),
    imageUrl: z
      .string()
      .url({ message: '올바른 URL 형식이 아닙니다' })
      .nullable()
      .optional(),
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
