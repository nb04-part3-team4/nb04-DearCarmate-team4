import { Router } from 'express';
import { adminController } from '@/features/admin/admin.controller';
import { authMiddleware } from '@/shared/middlewares/auth';
import { adminGuard } from '@/shared/middlewares/admin-guard';

const router = Router();

router.delete('/users/:userId', authMiddleware, adminGuard, (req, res, next) =>
  adminController.deleteUser(req, res, next),
);

export default router;
