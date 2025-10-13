import express from 'express';
import { upload } from '../middlewares/multer';
import * as contractDocumentController from '../controllers/contract-document.controller';

const router = express.Router();

// Use Authorization middleware

// 계약서 업로드 시 계약 목록 조회
router.get(
  '/contractDocuments',
  contractDocumentController.getContractDocuments,
);

// 계약서 추가 시 계약 목록 조회
router.get(
  '/contractDocuments/draft',
  contractDocumentController.getContractDrafts,
);

// 계약서 업로드
router.post(
  '/contractDocuments/upload',
  upload.single('contractDocument'),
  contractDocumentController.uploadContractDocument,
);

// 계약서 다운로드
router.get(
  '/contractDocuments/:contractDocumentId/download',
  contractDocumentController.downloadContractDocument,
);

export default router;
