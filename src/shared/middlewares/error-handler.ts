import { Request, Response, NextFunction } from 'express';
import { CustomError } from '@/shared/middlewares/custom-error';
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
    // 첫 번째 에러 메시지를 주 메시지로 사용
    const firstError = err.issues[0];
    const mainMessage = firstError
      ? `${firstError.path.join('.') ? firstError.path.join('.') + ': ' : ''}${firstError.message}`
      : '입력값이 올바르지 않습니다';

    const errorResponse: ErrorResponse = {
      status: 'error',
      message: mainMessage,
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
      const field = target[0] || '필드';

      // 필드명 한글화
      const fieldNameMap: Record<string, string> = {
        email: '이메일',
        employeeNumber: '사원번호',
        phoneNumber: '전화번호',
        companyCode: '기업코드',
      };
      const koreanField = fieldNameMap[field] || field;

      res.status(409).json({
        status: 'error',
        message: `이미 사용 중인 ${koreanField}입니다`,
      });
      return;
    }

    if (err.code === 'P2003') {
      res.status(400).json({
        status: 'error',
        message: '연관된 리소스를 찾을 수 없습니다',
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        status: 'error',
        message: '요청한 리소스를 찾을 수 없습니다',
      });
      return;
    }
  }

  const errorResponse: ErrorResponse = {
    status: 'error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : '서버 오류가 발생했습니다',
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(500).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: 'error',
    message: '요청한 경로를 찾을 수 없습니다',
    path: req.path,
  });
};
