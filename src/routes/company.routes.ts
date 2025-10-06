import { Router } from 'express';
import { companyController } from '@/controllers/company.controller';
import { authMiddleware } from '@/middlewares/auth';
import { adminGuard } from '@/middlewares/admin-guard';

const router = Router();
// POST /companies - 회사 생성 (인증 + 관리자 권한 필요)
router.post('/', authMiddleware, adminGuard, (req, res, next) =>
  companyController.createCompany(req, res, next),
);

// GET /companies - 회사 목록 조회 (인증 + 관리자 권한 필요)
router.get('/', authMiddleware, adminGuard, (req, res, next) =>
  companyController.getCompanies(req, res, next),
);

// GET /companies/users - 회사별 유저 목록 조회 (인증 + 관리자 권한 필요)
router.get('/users', authMiddleware, adminGuard, (req, res, next) =>
  companyController.getCompanyUsers(req, res, next),
);

// PATCH /companies/:companyId - 회사 정보 수정 (인증 + 관리자 권한 필요)
router.patch('/:companyId', authMiddleware, adminGuard, (req, res, next) =>
  companyController.updateCompany(req, res, next),
);

// DELETE /companies/:companyId - 회사 삭제 (인증 + 관리자 권한 필요)
router.delete('/:companyId', authMiddleware, adminGuard, (req, res, next) =>
  companyController.deleteCompany(req, res, next),
);

export default router;
