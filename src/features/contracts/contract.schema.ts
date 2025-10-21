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

export const updateContractSchema = z.object({
  status: z
    .enum(CONTRACT_STATUSES as unknown as [string, ...string[]])
    .optional(),
  resolutionDate: z
    .string()
    .datetime({ message: '유효한 ISO 8601 날짜-시간 문자열이 필요합니다.' })
    .nullable()
    .optional(),
  contractPrice: z.number().int().positive().optional(),
  userId: z.number().int().positive().optional(),
  customerId: z.number().int().positive().optional(),
  carId: z.number().int().positive().optional(),
  meetings: z
    .array(
      z.object({
        date: z.string().datetime({
          message: '유효한 ISO 8601 날짜-시간 문자열이 필요합니다.',
        }),
        alarms: z.array(
          z.string().datetime({
            message: '유효한 ISO 8601 날짜-시간 문자열이 필요합니다.',
          }),
        ),
      }),
    )
    .optional(),
});

export type CreateContractDto = z.infer<typeof createContractSchema>;
export type UpdateContractDto = z.infer<typeof updateContractSchema>;
