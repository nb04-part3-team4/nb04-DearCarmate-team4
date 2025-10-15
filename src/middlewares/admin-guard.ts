import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '@/middlewares/custom-error';
import prisma from '@/middlewares/prisma';

export const adminGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { isAdmin: true },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isAdmin) {
      throw new ForbiddenError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};
