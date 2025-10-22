import { z } from 'zod';
import { CONTRACT_STATUSES } from '@/features/contracts/contract.type';

const AlarmSchema = z.string().datetime({
  message: 'Alarm time must be a valid ISO 8601 date-time string.',
});

const MeetingSchema = z.object({
  date: z.string().datetime({
    message: 'Meeting date must be a valid ISO 8601 date-time string.',
  }),
  alarms: z.array(AlarmSchema),
});

export const createContractSchema = z.object({
  carId: z.number().int().positive({ message: 'A valid car ID is required.' }),
  customerId: z
    .number()
    .int()
    .positive({ message: 'A valid customer ID is required.' }),
  meetings: z.array(MeetingSchema).optional(),
});

const simpleDateRegex = /^\d{4}-\d{2}-\d{2}$/;

const ResolutionDateSchema = z.preprocess((value) => {
    return value;

}, z.union([
    z.string().refine(val => {
       const isIso = !isNaN(new Date(val).getTime());
       const isSimpleDate = simpleDateRegex.test(val);
       return isIso || isSimpleDate;
    }, { message: '유효한 ISO 8601 (타임존 생략 가능) 또는 YYYY-MM-DD 날짜 문자열이 필요합니다.' }),
    
    z.number(),
    z.literal(null),
])).nullable().optional();

export const updateContractSchema = z
  .object({
    status: z
      .enum(CONTRACT_STATUSES as unknown as [string, ...string[]])
      .optional(),

    resolutionDate: ResolutionDateSchema,

    contractPrice: z.number().int().positive().optional(),
    userId: z.number().int().positive().optional(),
    customerId: z.number().int().positive().optional(),
    carId: z.number().int().positive().optional(),
    meetings: z
      .array(
        z.object({
          /* ... */
        }),
      )
      .optional(),
  })
  .refine(
    (data) => {
      const SUCCESS_STATUS = 'contractSuccessful';

      if (data.status === SUCCESS_STATUS) {
        return (
          data.resolutionDate !== null && data.resolutionDate !== undefined
        );
      }
      return true;
    },
    {
      message:
        "계약 성공 상태('contractSuccessful')로 변경 시에는 해결 날짜(resolutionDate)가 필수로 입력되어야 합니다.",
      path: ['resolutionDate'],
    },
  );

export type CreateContractDto = z.infer<typeof createContractSchema>;
export type UpdateContractDto = z.infer<typeof updateContractSchema>;
