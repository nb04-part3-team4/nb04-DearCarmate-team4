import z from 'zod';

export const SEARCH_BY = ['carNumber', 'model'] as const;
export const CAR_STATUS_VALUES = [
  'possession',
  'contractProceeding',
  'contractCompleted',
] as const;

export const carsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(CAR_STATUS_VALUES).optional(),
  searchBy: z.enum(SEARCH_BY).optional(),
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
  accidentCount: z.number().int().nonnegative(),
  explanation: z
    .string()
    .optional()
    .transform((val) => val || null),
  accidentDetails: z
    .string()
    .optional()
    .transform((val) => val || null),
});

// 응답 스키마 + 타입 파생
export const carResponseSchema = carsBodySchema.extend({
  id: z.number().int().positive(),
  type: z.string(),
  status: z.enum(CAR_STATUS_VALUES),
});

export const getCarsResponseSchema = z.object({
  currentPage: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  totalItemCount: z.number().int().nonnegative(),
  data: z.array(carResponseSchema),
});

export const getCarModelsResponseSchema = z.object({
  data: z.array(
    z.object({
      manufacturer: z.string(),
      model: z.array(z.string()),
    }),
  ),
});
