import type { RequestHandler } from 'express';
import * as contractDocumentService from '../services/contract-document.service';
import {
  contractDocumentParamsSchema,
  getContractDocumentsQuerySchema,
  type GetContractDocumentsRequestDto,
} from '../dtos/contract-document.dto';

const getContractDocuments: RequestHandler = async (req, res, next) => {
  const validationResult = getContractDocumentsQuerySchema.safeParse(req.query);

  if (!validationResult.success) {
    return next(new Error('Invalid query parameters'));
  }

  if (!req.user) {
    return next(new Error('Unauthorized'));
  }

  const requestDto: GetContractDocumentsRequestDto = {
    ...validationResult.data,
    userId: req.user.userId,
  };

  try {
    const documents =
      await contractDocumentService.getContractDocuments(requestDto);

    if (!documents || documents.length === 0) {
      return next(new Error('No documents found'));
    }

    res.status(200).json(documents);
  } catch (error) {
    next(error);
  }
};

const getContractDrafts: RequestHandler = async (req, res, next) => {
  if (!req.user) {
    return next(new Error('Unauthorized'));
  }

  const userId = req.user.userId;

  try {
    const drafts = await contractDocumentService.getContractDrafts({ userId });

    if (!drafts || drafts.length === 0) {
      return next(new Error('No drafts found'));
    }

    res.status(200).json(drafts);
  } catch (error) {
    next(error);
  }
};

const uploadContractDocument: RequestHandler = async (req, res, next) => {
  try {
    const file = req.file as Express.Multer.File;
    if (!file) {
      return next(new Error('No file uploaded'));
    }

    const documentId =
      await contractDocumentService.uploadContractDocument(file);

    res.status(201).json(documentId);
  } catch (error) {
    next(error);
  }
};

const downloadContractDocument: RequestHandler = async (req, res, next) => {
  const validationResult = contractDocumentParamsSchema.safeParse(req.params);

  if (!validationResult.success) {
    return next(new Error('Invalid contractDocumentId'));
  }

  const { contractDocumentId } = validationResult.data;

  try {
    const document =
      await contractDocumentService.getContractDocumentById(contractDocumentId);

    if (!document || !document.fileUrl) {
      return next(new Error('File not found.'));
    }

    return res.download(document.fileUrl, document.fileName);
  } catch (error) {
    next(error);
  }
};

export {
  getContractDocuments,
  getContractDrafts,
  uploadContractDocument,
  downloadContractDocument,
};
