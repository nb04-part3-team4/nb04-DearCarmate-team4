import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '@/services/auth.service';
import { createTestCompany, createTestUser } from '../helpers/test-data';
import { UnauthorizedError } from '@/utils/custom-error';
import { verifyAccessToken, verifyRefreshToken } from '@/utils/jwt';

describe('AuthService', () => {
  let companyId: number;
  let userEmail: string;
  let userPassword: string;

  beforeEach(async () => {
    // Create test company and user for each test
    const company = await createTestCompany({
      name: 'Test Auth Company',
      companyCode: 'AUTH001',
    });
    companyId = company.id;

    userEmail = 'auth-test@example.com';
    userPassword = 'password123';

    await createTestUser(companyId, {
      email: userEmail,
      password: userPassword,
      name: 'Auth Test User',
      employeeNumber: 'EMP_AUTH_001',
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const result = await authService.login({
        email: userEmail,
        password: userPassword,
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(userEmail);
      expect(result.user.company.companyCode).toBe('AUTH001');

      // Verify tokens are valid
      const decodedAccess = verifyAccessToken(result.accessToken);
      expect(decodedAccess.email).toBe(userEmail);

      const decodedRefresh = verifyRefreshToken(result.refreshToken);
      expect(decodedRefresh.email).toBe(userEmail);
    });

    it('should throw UnauthorizedError with invalid email', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: userPassword,
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError with invalid password', async () => {
      await expect(
        authService.login({
          email: userEmail,
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('refreshAccessToken', () => {
    it('should successfully refresh access token with valid refresh token', async () => {
      // First, login to get tokens
      const loginResult = await authService.login({
        email: userEmail,
        password: userPassword,
      });

      // Then refresh the access token
      const refreshResult = await authService.refreshAccessToken(
        loginResult.refreshToken,
      );

      expect(refreshResult).toHaveProperty('accessToken');
      expect(refreshResult).toHaveProperty('refreshToken');

      // Verify new tokens are valid
      const decodedAccess = verifyAccessToken(refreshResult.accessToken);
      expect(decodedAccess.email).toBe(userEmail);
    });

    it('should throw UnauthorizedError with invalid refresh token', async () => {
      await expect(
        authService.refreshAccessToken('invalid.token.here'),
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
