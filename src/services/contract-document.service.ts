import * as contractDocumentRepository from '../repositories/contract-document.repository';

export const getContractDocuments = async (options: {
  page: number;
  pageSize: number;
  searchBy?: 'contractName' | 'userName' | 'carNumber';
  keyword?: string;
}) => {
  return await contractDocumentRepository.getContractDocuments({
    page: options.page,
    pageSize: options.pageSize,
    searchBy: options.searchBy,
    keyword: options.keyword,
  });
};

export const getContractDrafts = async () => {
  return await contractDocumentRepository.getContractDrafts();
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
