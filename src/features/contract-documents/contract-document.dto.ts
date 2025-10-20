import { z } from 'zod';

// Zod Schemas for Validation
export const getContractDocumentsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).default('1').transform(Number),
  pageSize: z.string().regex(/^\d+$/).default('8').transform(Number),
  searchBy: z.enum(['contractName', 'userName', 'carNumber']).optional(),
  keyword: z.string().optional(),
});

export const contractDocumentParamsSchema = z.object({
  contractDocumentId: z.string().regex(/^\d+$/).transform(Number),
});

// Request DTOs
export type GetContractDocumentsRequestDto = z.infer<
  typeof getContractDocumentsQuerySchema
> & { userId: number };

// Response DTOs
// TODO: Replace with actual response schema from Prisma model
export const contractDocumentResponseSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  totalItemCount: z.number(),
  data: z.array(
    z.object({
      id: z.number(),
      contractName: z.string(),
      resolutionDate: z.date().nullable(),
      documentCount: z.number(),
      manager: z.string(),
      carNumber: z.string(),
      documents: z.array(
        z.object({
          id: z.number(),
          fileName: z.string(),
        }),
      ),
    }),
  ),
});

export const contractDraftResponseSchema = z.object({
  id: z.number(),
  contractName: z.string(),
});

export const uploadContractDocumentResponseSchema = z.object({
  documentId: z.number(),
});

export type ContractDocumentResponseDto = z.infer<
  typeof contractDocumentResponseSchema
>;
// export type GetContractDocumentsResponseDto = ContractDocumentResponseDto[];

export type ContractDraftResponseDto = z.infer<
  typeof contractDraftResponseSchema
>;
export type GetContractDraftsResponseDto = ContractDraftResponseDto[];

export type UploadContractDocumentResponseDto = z.infer<
  typeof uploadContractDocumentResponseSchema
>;
