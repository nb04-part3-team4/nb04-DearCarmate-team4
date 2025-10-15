import * as contractDocumentRepository from '../repositories/contract-document.repository';
import {
  type GetContractDocumentsRequestDto,
  type GetContractDocumentsResponseDto,
  type GetContractDraftsResponseDto,
  type UploadContractDocumentResponseDto,
} from '../features/contract-document/contract-document.dto';

export const getContractDocuments = async (
  requestDto: GetContractDocumentsRequestDto,
): Promise<GetContractDocumentsResponseDto> => {
  const contracts =
    await contractDocumentRepository.getContractDocuments(requestDto);

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
    contractName: draft.contractName,
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
    throw new Error('Failed to upload document');
  }

  return { documentId: uploadedDocument.id };
};

export const getContractDocumentById = async (id: number) => {
  // This service function is used for file download and might not need a DTO.
  // Returning the full model is acceptable here.
  return await contractDocumentRepository.findContractDocumentById(id);
};
