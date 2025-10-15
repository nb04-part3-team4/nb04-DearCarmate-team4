import { describe, it, expect, beforeEach } from 'vitest';
import { companyService } from '@/features/companies/company.service';
import { createTestCompany, createTestUser } from '../helpers/test-data';
import {
  ConflictError,
  NotFoundError,
} from '@/shared/middlewares/custom-error';

describe('CompanyService', () => {
  let companyId: number;

  beforeEach(async () => {
    const company = await createTestCompany({
      name: 'Service Test Company',
      companyCode: 'SVCTEST001',
    });
    companyId = company.id;
  });

  describe('registerCompany', () => {
    it('should successfully create a new company', async () => {
      const result = await companyService.registerCompany({
        companyName: 'New Test Company',
        companyCode: 'NEWTEST001',
      });

      expect(result.id).toBeDefined();
      expect(result.companyName).toBe('New Test Company');
      expect(result.companyCode).toBe('NEWTEST001');
      expect(result.userCount).toBe(0);
    });

    it('should throw ConflictError when company code already exists', async () => {
      await expect(
        companyService.registerCompany({
          companyName: 'Duplicate Company',
          companyCode: 'SVCTEST001', // Already exists
        }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('getCompanies', () => {
    beforeEach(async () => {
      // Create additional companies
      await createTestCompany({
        name: 'Company A',
        companyCode: 'COMPA001',
      });
      await createTestCompany({
        name: 'Company B',
        companyCode: 'COMPB001',
      });
    });

    it('should return paginated companies list', async () => {
      const result = await companyService.getCompanies({
        page: 1,
        pageSize: 10,
      });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBeGreaterThan(0);
      expect(result.totalItemCount).toBeGreaterThan(0);
    });

    it('should return companies with correct structure', async () => {
      const result = await companyService.getCompanies({
        page: 1,
        pageSize: 10,
      });

      expect(result.data.length).toBeGreaterThan(0);
      const company = result.data[0];
      expect(company.id).toBeDefined();
      expect(company.companyName).toBeDefined();
      expect(company.companyCode).toBeDefined();
      expect(company.userCount).toBeDefined();
    });

    it('should support search by companyName', async () => {
      const result = await companyService.getCompanies({
        page: 1,
        pageSize: 10,
        searchBy: 'companyName',
        keyword: 'Company A',
      });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should respect pageSize parameter', async () => {
      const result = await companyService.getCompanies({
        page: 1,
        pageSize: 2,
      });

      expect(result.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('updateCompany', () => {
    it('should successfully update company', async () => {
      const result = await companyService.updateCompany(companyId, {
        companyName: 'Updated Company Name',
        companyCode: 'UPDATED001',
      });

      expect(result.id).toBe(companyId);
      expect(result.companyName).toBe('Updated Company Name');
      expect(result.companyCode).toBe('UPDATED001');
    });

    it('should update only companyName if companyCode not provided', async () => {
      const result = await companyService.updateCompany(companyId, {
        companyName: 'Updated Name Only',
      });

      expect(result.id).toBe(companyId);
      expect(result.companyName).toBe('Updated Name Only');
      expect(result.companyCode).toBe('SVCTEST001'); // Original code
    });

    it('should throw NotFoundError when company does not exist', async () => {
      await expect(
        companyService.updateCompany(99999, {
          companyName: 'Updated Company',
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteCompany', () => {
    it('should successfully delete company', async () => {
      await expect(
        companyService.deleteCompany(companyId),
      ).resolves.toBeUndefined();
    });

    it('should throw NotFoundError when company does not exist', async () => {
      await expect(companyService.deleteCompany(99999)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('getUsersByCompanyId', () => {
    beforeEach(async () => {
      // Create users for the test company
      await createTestUser(companyId, {
        email: 'user1@test.com',
        name: 'User One',
        employeeNumber: 'EMP001',
      });
      await createTestUser(companyId, {
        email: 'user2@test.com',
        name: 'User Two',
        employeeNumber: 'EMP002',
      });
      await createTestUser(companyId, {
        email: 'user3@test.com',
        name: 'User Three',
        employeeNumber: 'EMP003',
      });
    });

    it('should return paginated company users', async () => {
      const result = await companyService.getUsersByCompanyId({
        page: 1,
        pageSize: 10,
      });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBeGreaterThan(0);
      expect(result.totalItemCount).toBeGreaterThan(0);
    });

    it('should return users with correct structure', async () => {
      const result = await companyService.getUsersByCompanyId({
        page: 1,
        pageSize: 10,
      });

      const user = result.data[0];
      expect(user.id).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.employeeNumber).toBeDefined();
      expect(user.company).toBeDefined();
      expect(user.company.companyName).toBeDefined();
    });

    it('should support search by name', async () => {
      const result = await companyService.getUsersByCompanyId({
        page: 1,
        pageSize: 10,
        searchBy: 'name',
        keyword: 'User One',
      });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should support search by email', async () => {
      const result = await companyService.getUsersByCompanyId({
        page: 1,
        pageSize: 10,
        searchBy: 'email',
        keyword: 'user1@test.com',
      });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should support search by companyName', async () => {
      const result = await companyService.getUsersByCompanyId({
        page: 1,
        pageSize: 10,
        searchBy: 'companyName',
        keyword: 'Service Test',
      });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should respect pageSize parameter', async () => {
      const result = await companyService.getUsersByCompanyId({
        page: 1,
        pageSize: 2,
      });

      expect(result.data.length).toBeLessThanOrEqual(2);
    });
  });
});
