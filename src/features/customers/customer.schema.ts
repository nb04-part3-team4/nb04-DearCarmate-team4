import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  gender: z.enum(['male', 'female']),
  phoneNumber: z.string().min(1, '전화번호를 입력해주세요'),
  ageGroup: z.enum([
    '10대',
    '20대',
    '30대',
    '40대',
    '50대',
    '60대',
    '70대',
    '80대',
  ]),
  region: z.enum([
    '서울',
    '경기',
    '인천',
    '강원',
    '충북',
    '충남',
    '세종',
    '대전',
    '전북',
    '전남',
    '광주',
    '경북',
    '경남',
    '대구',
    '울산',
    '부산',
    '제주',
  ]),
  email: z.string().email('올바른 이메일 형식이 아닙니다').optional(),
  memo: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').optional(),
  gender: z.enum(['male', 'female']).optional(),
  phoneNumber: z.string().min(1, '전화번호를 입력해주세요').optional(),
  ageGroup: z
    .enum(['10대', '20대', '30대', '40대', '50대', '60대', '70대', '80대'])
    .optional(),
  region: z
    .enum([
      '서울',
      '경기',
      '인천',
      '강원',
      '충북',
      '충남',
      '세종',
      '대전',
      '전북',
      '전남',
      '광주',
      '경북',
      '경남',
      '대구',
      '울산',
      '부산',
      '제주',
    ])
    .optional(),
  email: z.string().email('올바른 이메일 형식이 아닙니다').optional(),
  memo: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
