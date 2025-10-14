import express from 'express';
import { upload } from '../middlewares/multer';
import * as contractDocumentController from '../controllers/contract-document.controller';
import { authMiddleware } from '@/middlewares/auth';

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
  upload.single('contractDocument'),
  contractDocumentController.uploadContractDocument,
);

// 계약서 다운로드
router.get(
  '/:contractDocumentId/download',
  authMiddleware,
  contractDocumentController.downloadContractDocument,
);

export default router;
