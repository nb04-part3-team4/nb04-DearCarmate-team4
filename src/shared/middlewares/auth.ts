import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/shared/middlewares/jwt';
import { UnauthorizedError } from '@/shared/middlewares/custom-error';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedError('Invalid token format');
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token expired'));
    } else if (error instanceof Error && error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};
