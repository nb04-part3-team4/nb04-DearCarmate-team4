import { Router } from 'express';
import { adminController } from '@/controllers/admin.controller';
import { authMiddleware } from '@/middlewares/auth';
import { adminGuard } from '@/middlewares/admin-guard';

const router = Router();

router.delete('/users/:userId', authMiddleware, adminGuard, (req, res, next) =>
  adminController.deleteUser(req, res, next),
);

export default router;
