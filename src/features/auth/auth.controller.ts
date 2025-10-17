import { Request, Response, NextFunction } from 'express';
import { authService } from '@/features/auth/auth.service';
import {
  loginSchema,
  refreshTokenSchema,
  googleLoginSchema,
} from '@/features/auth/auth.schema';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validatedData = googleLoginSchema.parse(req.body);
      const result = await authService.googleLogin(validatedData);

      res.status(200).json(result);
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
      const validatedData = refreshTokenSchema.parse(req.body);
      const result = await authService.refreshAccessToken(
        validatedData.refreshToken,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
