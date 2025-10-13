import { describe, it, expect, beforeEach } from 'vitest';
import { adminService } from '@/services/admin.service';
import {
  createTestCompany,
  createTestUser,
  createTestAdmin,
} from '../helpers/test-data';
import { NotFoundError, ForbiddenError } from '@/utils/custom-error';
import { userRepository } from '@/repositories/user.repository';

describe('AdminService', () => {
  let companyId: number;

  beforeEach(async () => {
    const company = await createTestCompany({
      name: 'Admin Test Company',
      companyCode: 'ADMIN001',
    });
    companyId = company.id;
  });

  describe('deleteUser', () => {
    it('should successfully delete a regular user', async () => {
      const user = await createTestUser(companyId, {
        email: 'delete-me@example.com',
        employeeNumber: 'EMPDEL001',
        isAdmin: false,
      });

      await expect(adminService.deleteUser(user.id)).resolves.not.toThrow();

      // Verify user is deleted
      const deletedUser = await userRepository.findById(user.id);
      expect(deletedUser).toBeNull();
    });

    it('should throw NotFoundError when deleting non-existent user', async () => {
      await expect(adminService.deleteUser(99999)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw ForbiddenError when trying to delete an admin user', async () => {
      const adminUser = await createTestAdmin(companyId);

      await expect(adminService.deleteUser(adminUser.id)).rejects.toThrow(
        ForbiddenError,
      );

      // Verify admin user still exists
      const stillExists = await userRepository.findById(adminUser.id);
      expect(stillExists).not.toBeNull();
    });
  });
});
