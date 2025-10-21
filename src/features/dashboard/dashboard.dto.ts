import { z } from 'zod';

const CarDataSchema = z.object({
  carType: z.string(),
  count: z.number(),
});

export const DashboardResponseSchema = z.object({
  monthlySales: z.number(),
  lastMonthSales: z.number(),
  growthRate: z.number().nullable(),
  proceedingContractsCount: z.number(),
  completedContractsCount: z.number(),
  contractsByCarType: z.array(CarDataSchema),
  salesByCarType: z.array(CarDataSchema),
});

export type DashboardResponseDto = z.infer<typeof DashboardResponseSchema>;
