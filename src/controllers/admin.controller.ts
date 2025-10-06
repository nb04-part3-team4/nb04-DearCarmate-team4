import { Request, Response, NextFunction } from 'express';
import { adminService } from '@/services/admin.service';
import { SuccessResponse } from '@/types/response';
import { BadRequestError } from '@/utils/custom-error';

export class AdminController {
  async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        throw new BadRequestError('Invalid user ID');
      }

      await adminService.deleteUser(userId);

      const response: SuccessResponse<null> = {
        status: 'success',
        data: null,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
