import { Request, Response, NextFunction } from 'express';
import { userService } from '@/features/users/user.service';
import { signupSchema, updateMeSchema } from '@/features/users/user.schema';
import { SuccessResponse } from '@/shared/types/response';
import { BadRequestError } from '@/shared/middlewares/custom-error';
import { requireAuth } from '@/shared/middlewares/auth-guard';
import type {
  SignupResponseDto,
  GetMeResponseDto,
  UpdateMeResponseDto,
  GetUserResponseDto,
} from '@/features/users/user.dto';

export class UserController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. 요청 데이터 검증
      const validatedData = signupSchema.parse(req.body);

      // 2. 회원가입 처리
      const result = await userService.signup(validatedData);

      // 3. 성공 응답
      const response: SuccessResponse<SignupResponseDto> = {
        status: 'success',
        data: result,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      requireAuth(req);

      const result = await userService.getMe(req.user.userId);

      // 3. 성공 응답
      const response: SuccessResponse<GetMeResponseDto> = {
        status: 'success',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      requireAuth(req);

      const validatedData = updateMeSchema.parse(req.body);
      const result = await userService.updateMe(req.user.userId, validatedData);

      // 4. 성공 응답
      const response: SuccessResponse<UpdateMeResponseDto> = {
        status: 'success',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      requireAuth(req);

      await userService.deleteMe(req.user.userId);

      res.status(200).json({ message: '유저 삭제 성공' });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        throw new BadRequestError('잘못된 요청입니다');
      }

      const result = await userService.getUserById(userId);

      const response: SuccessResponse<GetUserResponseDto> = {
        status: 'success',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
