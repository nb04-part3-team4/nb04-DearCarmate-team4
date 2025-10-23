import prisma from '../../shared/middlewares/prisma';
import { Prisma } from '@prisma/client';
import type { GetContractDocumentsRequestDto } from './contract-document.dto';
import type { Prisma } from '@prisma/client';

const getContractDocuments = async ({
  page,
  pageSize,
  searchBy,
  keyword,
  userId,
}: GetContractDocumentsRequestDto) => {
  const whereClause: Prisma.ContractWhereInput = {
    userId,
    status: 'contractSuccessful',
    documents: { some: {} },
  };

  const contracts = await prisma.contract.findMany({
    where: {
      ...whereClause,
      ...(searchBy && keyword
        ? {
            [searchBy]: {
              contains: keyword,
            },
          }
        : {}),
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
    where: { userId, status: 'contractSuccessful', documents: { none: {} } },
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

// 트랜잭션 지원 메서드: 기존 문서 연결 해제
const unlinkDocumentsByContractId = async (
  tx: Prisma.TransactionClient,
  contractId: number,
) => {
  return await tx.contractDocument.updateMany({
    where: { contractId },
    data: { contractId: null },
  });
};

// 트랜잭션 지원 메서드: 문서를 계약에 연결
const linkDocumentsToContract = async (
  tx: Prisma.TransactionClient,
  contractId: number,
  documents: Array<{ id: number; fileName: string }>,
) => {
  return await Promise.all(
    documents.map((doc) =>
      tx.contractDocument.update({
        where: { id: doc.id },
        data: {
          contractId,
          fileName: doc.fileName,
        },
      }),
    ),
  );
};

export {
  getContractDocuments,
  getContractDrafts,
  uploadContractDocument,
  findContractDocumentById,
  unlinkDocumentsByContractId,
  linkDocumentsToContract,
};
