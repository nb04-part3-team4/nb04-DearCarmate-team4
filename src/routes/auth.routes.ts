import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';

const router = Router();

// POST /auth/login - 로그인
router.post('/login', (req, res, next) => authController.login(req, res, next));

// POST /auth/refresh - 토큰 재발급
router.post('/refresh', (req, res, next) =>
  authController.refresh(req, res, next),
);

export default router;
