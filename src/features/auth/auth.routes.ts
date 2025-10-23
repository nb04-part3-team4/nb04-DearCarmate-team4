import { Router } from 'express';
import { authController } from '@/features/auth/auth.controller';
import { authMiddleware } from '@/shared/middlewares/auth';

const router = Router();

// POST /auth/login - 로그인
router.post('/login', (req, res, next) => authController.login(req, res, next));

// POST /auth/google - Google 로그인
router.post('/google', (req, res, next) =>
  authController.googleLogin(req, res, next),
);

// POST /auth/google/signup - Google 회원가입
router.post('/google/signup', (req, res, next) =>
  authController.googleSignup(req, res, next),
);

// POST /auth/google/reauth - Google 재인증 (로그인 필요)
router.post('/google/reauth', authMiddleware, (req, res, next) =>
  authController.googleReauth(req, res, next),
);

// POST /auth/refresh - 토큰 재발급
router.post('/refresh', (req, res, next) =>
  authController.refresh(req, res, next),
);

export default router;
