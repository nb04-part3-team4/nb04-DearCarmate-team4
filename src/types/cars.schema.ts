import { CarStatus } from '@prisma/client';
import z from 'zod';

export const carsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(CarStatus).optional(),
  searchBy: z.enum(['carNumber', 'model']).optional(),
  keyword: z.string().optional(),
});

export const carsBodySchema = z.object({
  carNumber: z.string().regex(
    /^\d{2,3}[가-힣]\d{4}$/, // 차랑번호 xx가xxxx / xxx가xxxx 형식의 정규식 패턴
    '차량 번호 형식이 올바르지 않습니다.',
  ),
  manufacturer: z.string(),
  model: z.string(),
  manufacturingYear: z.number().int().positive(),
  mileage: z.number().int().positive(),
  price: z.number().int().positive(),
  accidentCount: z.number().int().positive(),
  explanation: z
    .string()
    .optional()
    .transform((val) => val || null),
  accidentDetails: z
    .string()
    .optional()
    .transform((val) => val || null),
});
