import * as contractDocumentRepository from './contract-document.repository';
import {
  type GetContractDocumentsRequestDto,
  type GetContractDraftsResponseDto,
  type UploadContractDocumentResponseDto,
  type ContractDocumentResponseDto,
} from './contract-document.dto';

export const getContractDocuments = async (
  requestDto: GetContractDocumentsRequestDto,
): Promise<ContractDocumentResponseDto> => {
  const currentPage = 0;
  const totalPages = 0;
  const totalItemCount = 0;
  const data = (
    await contractDocumentRepository.getContractDocuments(requestDto)
  ).map((contract) => ({
    id: contract.id,
    contractName: contract.contractName,
    resolutionDate: contract.resolutionDate,
    manager: contract.user.name,
    carNumber: contract.car.carNumber,
    documentCount: contract.documents.length,
    documents: contract.documents,
  }));

  const contracts: ContractDocumentResponseDto = {
    currentPage,
    totalPages,
    totalItemCount,
    data,
  };

  return contracts;
};

export const getContractDrafts = async ({
  userId,
}: {
  userId: number;
}): Promise<GetContractDraftsResponseDto> => {
  const drafts = await contractDocumentRepository.getContractDrafts({ userId });
  return drafts.map((draft) => ({
    id: draft.id,
    data: draft.contractName,
  }));
};

export const uploadContractDocument = async (
  file: Express.Multer.File,
): Promise<UploadContractDocumentResponseDto> => {
  const uploadedDocument =
    await contractDocumentRepository.uploadContractDocument({
      fileUrl: file.path,
      fileName: file.originalname,
      fileSize: file.size,
    });

  if (!uploadedDocument) {
    throw new Error('문서를 업로드할 수 없습니다');
  }

  return { documentId: uploadedDocument.id };
};

export const getContractDocumentById = async (id: number) => {
  // This service function is used for file download and might not need a DTO.
  // Returning the full model is acceptable here.
  return await contractDocumentRepository.findContractDocumentById(id);
};
