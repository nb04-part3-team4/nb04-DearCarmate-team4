import { Request, Response, NextFunction } from 'express';
import { userService } from '@/services/user.service';
import { signupSchema, updateMeSchema } from '@/types/user.schema';
import { SuccessResponse } from '@/types/response';
import { UnauthorizedError, BadRequestError } from '@/utils/custom-error';
import type {
  SignupResponseDto,
  GetMeResponseDto,
  UpdateMeResponseDto,
  GetUserResponseDto,
} from '@/dtos/user.dto';

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
      // 1. 인증된 유저 확인
      if (!req.user) {
        throw new UnauthorizedError('로그인이 필요합니다');
      }

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
      // 1. 인증된 유저 확인
      if (!req.user) {
        throw new UnauthorizedError('로그인이 필요합니다');
      }

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
      if (!req.user) {
        throw new UnauthorizedError('로그인이 필요합니다');
      }

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
