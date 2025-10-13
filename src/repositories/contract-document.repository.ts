import prisma from '../utils/prisma';

const getContractDocuments = async ({
  page,
  pageSize,
  searchBy,
  keyword,
}: {
  page: number;
  pageSize: number;
  searchBy?: 'contractName' | 'userName' | 'carNumber';
  keyword?: string;
}) => {
  const contracts = await prisma.contract.findMany({
    where:
      searchBy && keyword
        ? {
            [searchBy]: { contains: keyword },
          }
        : {
            // No filtering if searchBy or keyword is not provided
          },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return contracts;
};

const getContractDrafts = async () => {};

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
