import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';
import { loginSchema, refreshTokenSchema } from '@/types/auth.schema';
import { SuccessResponse } from '@/types/response';
import type {
  LoginResponseDto,
  RefreshTokenResponseDto,
} from '@/dtos/auth.dto';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. 요청 데이터 검증
      const validatedData = loginSchema.parse(req.body);

      // 2. 로그인 처리
      const result = await authService.login(validatedData);

      // 3. 성공 응답
      const response: SuccessResponse<LoginResponseDto> = {
        status: 'success',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async refresh(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // 1. 요청 데이터 검증
      const validatedData = refreshTokenSchema.parse(req.body);

      // 2. 토큰 재발급 처리
      const result = await authService.refreshAccessToken(
        validatedData.refreshToken,
      );

      // 3. 성공 응답
      const response: SuccessResponse<RefreshTokenResponseDto> = {
        status: 'success',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
