import type { RequestHandler } from 'express';
import * as contractDocumentService from './contract-document.service';
import {
  contractDocumentParamsSchema,
  getContractDocumentsQuerySchema,
  type GetContractDocumentsRequestDto,
} from './contract-document.dto';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '@/shared/middlewares/custom-error';

const getContractDocuments: RequestHandler = async (req, res, next) => {
  const validationResult = getContractDocumentsQuerySchema.safeParse(req.query);

  if (!validationResult.success) {
    return next(new BadRequestError('잘못된 요청입니다'));
  }

  if (!req.user) {
    return next(new UnauthorizedError('로그인이 필요합니다'));
  }

  const requestDto: GetContractDocumentsRequestDto = {
    ...validationResult.data,
    userId: req.user.userId,
  };

  try {
    const documents =
      await contractDocumentService.getContractDocuments(requestDto);

    /* if (!documents) {
      return next(new NotFoundError('문서를 찾을 수 없습니다'));
    } */

    res.status(200).json(documents);
  } catch (error) {
    next(error);
  }
};

const getContractDrafts: RequestHandler = async (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('로그인이 필요합니다'));
  }

  const userId = req.user.userId;

  try {
    const drafts = await contractDocumentService.getContractDrafts({ userId });

    /* if (!drafts || drafts.length === 0) {
      const error = new NotFoundError('초안을 찾을 수 없습니다');

      return next(error);
    } */

    res.status(200).json(drafts);
  } catch (error) {
    next(error);
  }
};

const uploadContractDocument: RequestHandler = async (req, res, next) => {
  try {
    const file = req.file as Express.Multer.File;
    if (!file) {
      return next(new NotFoundError('파일을 찾을 수 없습니다'));
    }

    const data = await contractDocumentService.uploadContractDocument(file);

    res.status(201).json({ contractDocumentId: data.documentId });
  } catch (error) {
    next(error);
  }
};

const downloadContractDocument: RequestHandler = async (req, res, next) => {
  const validationResult = contractDocumentParamsSchema.safeParse(req.params);

  if (!validationResult.success) {
    return next(new BadRequestError('잘못된 요청입니다'));
  }

  const { contractDocumentId } = validationResult.data;

  try {
    const document =
      await contractDocumentService.getContractDocumentById(contractDocumentId);

    if (!document || !document.fileUrl) {
      return next(new NotFoundError('파일을 찾을 수 없습니다'));
    }

    return (
      res
        .status(200)
        // .json({ message: '계약서 다운로드 성공' })
        .download(document.fileUrl, document.fileName)
    );
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
