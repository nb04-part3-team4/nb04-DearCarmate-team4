import type { RequestHandler } from 'express';
import { z } from 'zod';
import * as contractDocumentService from '../services/contract-document.service';

const getContractDocuments: RequestHandler = async (req, res, next) => {
  const querySchema = z.object({
    page: z.string().regex(/^\d+$/).default('1').transform(Number),
    pageSize: z.string().regex(/^\d+$/).default('8').transform(Number),
    searchBy: z.enum(['contractName', 'userName', 'carNumber']).optional(),
    keyword: z.string().optional(),
  });

  const validationResult = querySchema.safeParse(req.query);

  if (!validationResult.success) {
    return next(new Error('Invalid query parameters'));
  }

  const { page, pageSize, searchBy, keyword } = validationResult.data;

  if (!req.user) {
    return next(new Error('Unauthorized'));
  }

  const userId = req.user.userId;

  try {
    const documents = await contractDocumentService.getContractDocuments({
      page,
      pageSize,
      searchBy,
      keyword,
      userId,
    });

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

    res.status(201).json({ documentId });
  } catch (error) {
    next(error);
  }
};

const downloadContractDocument: RequestHandler = async (req, res, next) => {
  const paramsSchema = z.object({
    contractDocumentId: z.string().regex(/^\d+$/).transform(Number),
  });

  const validationResult = paramsSchema.safeParse(req.params);

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
