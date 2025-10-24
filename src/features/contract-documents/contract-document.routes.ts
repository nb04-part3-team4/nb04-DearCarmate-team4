import express from 'express';
import { uploadImage } from '../../shared/middlewares/multer';
import * as contractDocumentController from './contract-document.controller';
import { authMiddleware } from '../../shared/middlewares/auth';

const router = express.Router();

// 계약서 업로드 시 계약 목록 조회
router.get(
  '/',
  authMiddleware,
  contractDocumentController.getContractDocuments,
);

// 계약서 추가 시 계약 목록 조회
router.get(
  '/draft',
  authMiddleware,
  contractDocumentController.getContractDrafts,
);

// 계약서 업로드
router.post(
  '/upload',
  authMiddleware,
  uploadImage.single('file'),
  contractDocumentController.uploadContractDocument,
);

// 계약서 다운로드
router.get(
  '/:contractDocumentId/download',
  authMiddleware,
  contractDocumentController.downloadContractDocument,
);

export default router;
