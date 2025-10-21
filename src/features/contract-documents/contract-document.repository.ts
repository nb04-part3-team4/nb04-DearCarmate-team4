import prisma from '../../shared/middlewares/prisma';
import type { GetContractDocumentsRequestDto } from './contract-document.dto';

const getContractDocuments = async ({
  page,
  pageSize,
  searchBy,
  keyword,
  userId,
}: GetContractDocumentsRequestDto) => {
  const contracts = await prisma.contract.findMany({
    where:
      searchBy && keyword
        ? {
            [searchBy]: { contains: keyword },
            userId: userId,
          }
        : {
            userId: userId,
          },
    select: {
      id: true,
      contractName: true,
      resolutionDate: true,

      // manager: true,
      user: { select: { name: true } },

      // carNumber: true,
      car: { select: { carNumber: true } },

      // documentCount: true,
      documents: { select: { id: true, fileName: true } },
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return contracts;
};

const getContractDrafts = async ({ userId }: { userId: number }) => {
  const drafts = await prisma.contract.findMany({
    where: { userId, status: 'DRAFT' }, // 검증 필요
    select: { id: true, contractName: true },
  });

  return drafts;
};

const uploadContractDocument = async ({
  fileUrl,
  fileName,
  fileSize,
}: {
  fileUrl: string;
  fileName: string;
  fileSize: number;
}) => {
  const uploadedDocument = await prisma.contractDocument.create({
    data: {
      fileName,
      fileUrl,
      fileSize,
    },
  });

  return uploadedDocument;
};

const findContractDocumentById = async (id: number) => {
  return await prisma.contractDocument.findUnique({
    where: { id },
  });
};

export {
  getContractDocuments,
  getContractDrafts,
  uploadContractDocument,
  findContractDocumentById,
};
