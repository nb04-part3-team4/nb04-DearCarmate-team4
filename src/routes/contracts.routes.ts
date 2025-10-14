import express, { Router } from 'express';
import { contractController } from '@/controllers/contracts.controller';
import { authMiddleware } from '@/middlewares/auth';
import { adminGuard } from '@/middlewares/admin-guard';

const router: Router = express.Router();

// POST /contracts - 계약 등록 (어드민만 가능)
router.post('/contracts', authMiddleware, adminGuard, (req, res, next) =>
  contractController.createContract(req, res, next),
);

// GET /contracts - 계약 목록 조회 (인증된 사용자)
router.get('/contracts', authMiddleware, (req, res, next) =>
  contractController.getContracts(req, res, next),
);

// PATCH /contracts/:id - 계약 수정 (담당자만 가능)
router.patch('/contracts/:id', authMiddleware, (req, res, next) =>
  contractController.updateContract(req, res, next),
);

// DELETE /contracts/:id - 계약 삭제 (담당자만 가능)
router.delete('/contracts/:id', authMiddleware, (req, res, next) =>
  contractController.deleteContract(req, res, next),
);

export default router;
