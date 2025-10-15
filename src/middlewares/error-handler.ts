import { Request, Response, NextFunction } from 'express';
import { CustomError } from '@/middlewares/custom-error';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

interface ErrorResponse {
  status: 'error';
  message: string;
  errors?: unknown;
  stack?: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void => {
  console.error('❌ Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof CustomError) {
    const errorResponse: ErrorResponse = {
      status: 'error',
      message: err.message,
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
    }

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  if (err instanceof ZodError) {
    const errorResponse: ErrorResponse = {
      status: 'error',
      message: 'Validation failed',
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };

    res.status(400).json(errorResponse);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || [];
      const field = target[0] || 'field';

      res.status(409).json({
        status: 'error',
        message: `${field} already exists`,
      });
      return;
    }

    if (err.code === 'P2003') {
      res.status(400).json({
        status: 'error',
        message: 'Related resource not found',
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        status: 'error',
        message: 'Resource not found',
      });
      return;
    }
  }

  const errorResponse: ErrorResponse = {
    status: 'error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error',
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(500).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.path,
  });
};
