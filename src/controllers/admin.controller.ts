import { Request, Response, NextFunction } from 'express';
import { adminService } from '@/services/admin.service';
import { BadRequestError } from '@/middlewares/custom-error';

export class AdminController {
  async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        throw new BadRequestError('잘못된 요청입니다');
      }

      await adminService.deleteUser(userId);

      res.status(200).json({ message: '유저 삭제 성공' });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
