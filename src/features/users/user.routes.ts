import { Router } from 'express';
import { userController } from '@/features/users/user.controller';
import { authMiddleware } from '@/shared/middlewares/auth';
import { adminGuard } from '@/shared/middlewares/admin-guard';

const router = Router();

// POST /users - 회원가입 (공개)
router.post('/', (req, res, next) => userController.signup(req, res, next));

// GET /users/me - 내 정보 조회 (인증 필요)
router.get('/me', authMiddleware, (req, res, next) =>
  userController.getMe(req, res, next),
);

// PATCH /users/me - 내 정보 수정 (인증 필요)
router.patch('/me', authMiddleware, (req, res, next) =>
  userController.updateMe(req, res, next),
);

// DELETE /users/me - 회원 탈퇴 (인증 필요)
router.delete('/me', authMiddleware, (req, res, next) =>
  userController.deleteMe(req, res, next),
);

// GET /users/:userId - 특정 유저 조회 (인증 + 관리자 권한 필요)
router.get('/:userId', authMiddleware, adminGuard, (req, res, next) =>
  userController.getUserById(req, res, next),
);

// DELETE /users/:userId - 특정 유저 삭제 (인증 + 관리자 권한 필요)
router.delete('/:userId', authMiddleware, adminGuard, (req, res, next) =>
  userController.deleteUser(req, res, next),
);

export default router;
