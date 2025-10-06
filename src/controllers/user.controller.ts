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
        throw new UnauthorizedError('Authentication required');
      }

      // 2. 내 정보 조회
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
        throw new UnauthorizedError('Authentication required');
      }

      // 2. 요청 데이터 검증
      const validatedData = updateMeSchema.parse(req.body);

      // 3. 내 정보 수정
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
        throw new UnauthorizedError('Authentication required');
      }

      await userService.deleteMe(req.user.userId);

      const response: SuccessResponse<null> = {
        status: 'success',
        data: null,
      };

      res.status(200).json(response);
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
        throw new BadRequestError('Invalid user ID');
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
