import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  companyCode: z.string().min(1, 'Company code is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export const companyQuerySchema = z.object({
  companyCode: z.string().optional(),
  name: z.string().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CompanyQueryParams = z.infer<typeof companyQuerySchema>;
