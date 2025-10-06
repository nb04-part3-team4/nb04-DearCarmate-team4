import { Router } from 'express';
import { companyController } from '@/controllers/company.controller';
import { authMiddleware } from '@/middlewares/auth';
import { adminGuard } from '@/middlewares/admin-guard';

const router = Router();

router.post('/', authMiddleware, adminGuard, (req, res, next) =>
  companyController.createCompany(req, res, next),
);

router.get('/', authMiddleware, adminGuard, (req, res, next) =>
  companyController.getCompanies(req, res, next),
);

router.get('/:companyId/users', authMiddleware, adminGuard, (req, res, next) =>
  companyController.getCompanyUsers(req, res, next),
);

export default router;
