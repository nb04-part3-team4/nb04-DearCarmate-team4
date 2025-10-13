import * as contractDocumentRepository from '../repositories/contract-document.repository';

export const getContractDocuments = async (options: {
  page: number;
  pageSize: number;
  searchBy?: 'contractName' | 'userName' | 'carNumber';
  keyword?: string;
  userId: number;
}) => {
  return await contractDocumentRepository.getContractDocuments({
    page: options.page,
    pageSize: options.pageSize,
    searchBy: options.searchBy,
    keyword: options.keyword,
    userId: options.userId,
  });
};

export const getContractDrafts = async ({ userId }: { userId: number }) => {
  return await contractDocumentRepository.getContractDrafts({ userId });
};

export const uploadContractDocument = async (file: Express.Multer.File) => {
  const uploadedDocument =
    await contractDocumentRepository.uploadContractDocument({
      fileUrl: file.path,
      fileName: file.originalname,
      fileSize: file.size,
    });

  if (!uploadedDocument) {
    throw new Error('Failed to upload document');
  }

  return uploadedDocument.id;
};

export const getContractDocumentById = async (id: number) => {
  return await contractDocumentRepository.findContractDocumentById(id);
};
