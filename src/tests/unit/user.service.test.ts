import { describe, it, expect, beforeEach } from 'vitest';
import { userService } from '@/features/users/user.service';
import { createTestCompany, createTestUser } from '../helpers/test-data';
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from '@/shared/middlewares/custom-error';

describe('UserService', () => {
  let companyId: number;
  let companyCode: string;

  beforeEach(async () => {
    const company = await createTestCompany({
      name: 'User Test Company',
      companyCode: 'USER001',
    });
    companyId = company.id;
    companyCode = company.companyCode;
  });

  describe('signup', () => {
    it('should successfully create a new user with valid data', async () => {
      const signupData = {
        email: 'newuser@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
        name: 'New User',
        employeeNumber: 'EMP002',
        phoneNumber: '010-1234-5678',
        companyName: 'User Test Company',
        companyCode: companyCode,
      };

      const result = await userService.signup(signupData);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(signupData.email);
      expect(result.name).toBe(signupData.name);
      expect(result.employeeNumber).toBe(signupData.employeeNumber);
      expect(result.phoneNumber).toBe(signupData.phoneNumber);
      expect(result.company.companyName).toBe('User Test Company');
      expect(result.isAdmin).toBe(false);
    });

    it('should throw BadRequestError with invalid company code', async () => {
      const signupData = {
        email: 'newuser@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
        name: 'New User',
        employeeNumber: 'EMP002',
        companyName: 'Invalid Company',
        companyCode: 'INVALID',
      };

      await expect(userService.signup(signupData)).rejects.toThrow(
        BadRequestError,
      );
    });

    it('should throw ConflictError when email already exists', async () => {
      // Create existing user
      await createTestUser(companyId, {
        email: 'existing@example.com',
        employeeNumber: 'EMP003',
      });

      const signupData = {
        email: 'existing@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
        name: 'Duplicate User',
        employeeNumber: 'EMP004',
        companyName: 'User Test Company',
        companyCode: companyCode,
      };

      await expect(userService.signup(signupData)).rejects.toThrow(
        ConflictError,
      );
    });
  });

  describe('getMe', () => {
    it('should return user info for valid userId', async () => {
      const user = await createTestUser(companyId, {
        email: 'getme@example.com',
        name: 'Get Me User',
        employeeNumber: 'EMPGETME',
      });

      const result = await userService.getMe(user.id);

      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result.name).toBe(user.name);
      expect(result.company.companyName).toBe('User Test Company');
    });

    it('should throw NotFoundError for non-existent userId', async () => {
      await expect(userService.getMe(99999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateMe', () => {
    it('should successfully update user info without password change', async () => {
      const user = await createTestUser(companyId, {
        email: 'update@example.com',
        name: 'Update User',
        employeeNumber: 'EMPUPDATE',
        phoneNumber: '010-1111-1111',
      });

      const updateData = {
        phoneNumber: '010-9999-9999',
        employeeNumber: 'EMPUPDATED',
      };

      const result = await userService.updateMe(user.id, updateData);

      expect(result.phoneNumber).toBe(updateData.phoneNumber);
      expect(result.employeeNumber).toBe(updateData.employeeNumber);
      expect(result.name).toBe(user.name); // unchanged
    });

    it('should successfully update user password with current password verification', async () => {
      const originalPassword = 'oldpassword123';
      const user = await createTestUser(companyId, {
        email: 'pwchange@example.com',
        password: originalPassword,
        name: 'Password Change User',
        employeeNumber: 'EMPPW',
      });

      const updateData = {
        currentPassword: originalPassword,
        password: 'newpassword123',
        passwordConfirmation: 'newpassword123',
      };

      const result = await userService.updateMe(user.id, updateData);

      expect(result.id).toBe(user.id);
      // Password should be updated (can be verified by trying to login with new password)
    });

    it('should throw BadRequestError with wrong current password', async () => {
      const user = await createTestUser(companyId, {
        email: 'wrongpw@example.com',
        password: 'correctpassword',
        employeeNumber: 'EMPWRONG',
      });

      const updateData = {
        currentPassword: 'wrongpassword',
        password: 'newpassword123',
        passwordConfirmation: 'newpassword123',
      };

      await expect(userService.updateMe(user.id, updateData)).rejects.toThrow(
        BadRequestError,
      );
    });
  });

  describe('deleteMe', () => {
    it('should successfully delete user', async () => {
      const user = await createTestUser(companyId, {
        email: 'delete@example.com',
        employeeNumber: 'EMPDEL',
      });

      await expect(userService.deleteMe(user.id)).resolves.not.toThrow();

      // Verify user is deleted
      await expect(userService.getMe(user.id)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when deleting non-existent user', async () => {
      await expect(userService.deleteMe(99999)).rejects.toThrow(NotFoundError);
    });
  });
});
