import { Request } from 'express';
import { UnauthorizedError } from './custom-error';

/**
 * Type guard to ensure request has authenticated user
 * Throws UnauthorizedError if user is not authenticated
 */
export function requireAuth(
  req: Request,
): asserts req is Request & { user: { userId: number; email: string } } {
  if (!req.user) {
    throw new UnauthorizedError('로그인이 필요합니다');
  }
}
