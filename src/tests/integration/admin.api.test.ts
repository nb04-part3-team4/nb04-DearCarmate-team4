import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@/app';
import {
  createTestCompany,
  createTestUser,
  createTestAdmin,
} from '../helpers/test-data';

describe('Admin API (E2E)', () => {
  let companyId: number;
  let adminToken: string;
  let userToken: string;
  let regularUserId: number;

  beforeEach(async () => {
    const company = await createTestCompany({
      name: 'Admin API Test Company',
      companyCode: 'ADMINAPI001',
    });
    companyId = company.id;

    // Create admin user
    const adminPassword = 'password123'; // Use default password
    const admin = await createTestAdmin(companyId);

    // Create regular user
    const userPassword = 'password123'; // Use default password
    const regularUser = await createTestUser(companyId, {
      email: 'regular@example.com',
      name: 'Regular User',
      employeeNumber: 'EMPREG001',
      isAdmin: false,
    });
    regularUserId = regularUser.id;

    // Login as admin
    const adminLoginResponse = await request(app).post('/auth/login').send({
      email: admin.email,
      password: adminPassword,
    });
    adminToken = adminLoginResponse.body.accessToken;

    // Login as regular user
    const userLoginResponse = await request(app).post('/auth/login').send({
      email: regularUser.email,
      password: userPassword,
    });
    userToken = userLoginResponse.body.accessToken;
  });

  describe('DELETE /admin/users/:userId', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).delete(
        `/admin/users/${regularUserId}`,
      );

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should return 403 when non-admin tries to delete user', async () => {
      const response = await request(app)
        .delete(`/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Admin access required');
    });

    it('should return 404 when deleting non-existent user', async () => {
      const response = await request(app)
        .delete('/admin/users/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });

    it('should return 403 when trying to delete an admin user', async () => {
      // Create another admin with different email
      const anotherAdmin = await createTestUser(companyId, {
        email: 'another-admin@example.com',
        password: 'admin123',
        name: 'Another Admin',
        employeeNumber: 'ADMIN002',
        isAdmin: true,
      });

      const response = await request(app)
        .delete(`/admin/users/${anotherAdmin.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('관리자는 삭제할 수 없습니다');
    });

    it('should successfully delete a user as admin', async () => {
      const response = await request(app)
        .delete(`/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });
  });
});
