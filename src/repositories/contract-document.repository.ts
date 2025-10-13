import prisma from '../utils/prisma';

const getContractDocuments = async ({
  page,
  pageSize,
  searchBy,
  keyword,
  userId,
}: {
  page: number;
  pageSize: number;
  searchBy?: 'contractName' | 'userName' | 'carNumber';
  keyword?: string;
  userId: number;
}) => {
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
  const uploadedDocment = await prisma.contractDocument.create({
    data: {
      fileName,
      fileUrl,
      fileSize,
    },
  });

  return uploadedDocment;
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
