import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@/app';
import {
  createTestCompany,
  createTestUser,
  createTestAdmin,
} from '../helpers/test-data';

describe('Company API (E2E)', () => {
  let companyId: number;
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    const company = await createTestCompany({
      name: 'Company API Test Company',
      companyCode: 'COMPAPI001',
    });
    companyId = company.id;

    // Create admin user
    const adminPassword = 'password123';
    const admin = await createTestAdmin(companyId);

    // Create regular user
    const userPassword = 'password123';
    const regularUser = await createTestUser(companyId, {
      email: 'regular@example.com',
      name: 'Regular User',
      employeeNumber: 'EMPREG001',
      isAdmin: false,
    });

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

  describe('POST /companies', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).post('/companies').send({
        companyName: 'New Company',
        companyCode: 'NEWCO001',
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should return 403 when non-admin tries to create company', async () => {
      const response = await request(app)
        .post('/companies')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          companyName: 'New Company',
          companyCode: 'NEWCO001',
        });

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
    });

    it('should successfully create a company as admin', async () => {
      const response = await request(app)
        .post('/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          companyName: 'New Company',
          companyCode: 'NEWCO001',
        });

      expect(response.status).toBe(201);
      expect(response.body.companyName).toBe('New Company');
      expect(response.body.companyCode).toBe('NEWCO001');
      expect(response.body.id).toBeDefined();
      expect(response.body.userCount).toBeDefined();
    });

    it('should return 400 with invalid data', async () => {
      const response = await request(app)
        .post('/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          companyName: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /companies', () => {
    beforeEach(async () => {
      // Create additional companies for pagination test
      await createTestCompany({
        name: 'Company A',
        companyCode: 'COMPA001',
      });
      await createTestCompany({
        name: 'Company B',
        companyCode: 'COMPB001',
      });
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/companies');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should return 403 when non-admin tries to get companies', async () => {
      const response = await request(app)
        .get('/companies')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
    });

    it('should successfully get companies list as admin', async () => {
      const response = await request(app)
        .get('/companies')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.currentPage).toBeDefined();
      expect(response.body.totalPages).toBeDefined();
      expect(response.body.totalItemCount).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/companies?page=1&pageSize=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.currentPage).toBe(1);
    });

    it('should support search by companyName', async () => {
      const response = await request(app)
        .get('/companies?searchBy=companyName&keyword=Company A')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /companies/users', () => {
    beforeEach(async () => {
      // Create additional users
      await createTestUser(companyId, {
        email: 'user1@example.com',
        name: 'User One',
        employeeNumber: 'EMP002',
      });
      await createTestUser(companyId, {
        email: 'user2@example.com',
        name: 'User Two',
        employeeNumber: 'EMP003',
      });
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/companies/users');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should return 403 when non-admin tries to get company users', async () => {
      const response = await request(app)
        .get('/companies/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
    });

    it('should successfully get company users as admin', async () => {
      const response = await request(app)
        .get('/companies/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.currentPage).toBeDefined();
      expect(response.body.totalPages).toBeDefined();
    });

    it('should support search by name', async () => {
      const response = await request(app)
        .get('/companies/users?searchBy=name&keyword=User One')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('should support search by email', async () => {
      const response = await request(app)
        .get('/companies/users?searchBy=email&keyword=user1@example.com')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('should support search by companyName', async () => {
      const response = await request(app)
        .get('/companies/users?searchBy=companyName&keyword=Company API')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('PATCH /companies/:companyId', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .patch(`/companies/${companyId}`)
        .send({
          companyName: 'Updated Company',
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should return 403 when non-admin tries to update company', async () => {
      const response = await request(app)
        .patch(`/companies/${companyId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          companyName: 'Updated Company',
        });

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
    });

    it('should return 404 when updating non-existent company', async () => {
      const response = await request(app)
        .patch('/companies/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          companyName: 'Updated Company',
        });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });

    it('should successfully update company as admin', async () => {
      const response = await request(app)
        .patch(`/companies/${companyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          companyName: 'Updated Company Name',
          companyCode: 'UPDATED001',
        });

      expect(response.status).toBe(200);
      expect(response.body.companyName).toBe('Updated Company Name');
      expect(response.body.companyCode).toBe('UPDATED001');
      expect(response.body.id).toBe(companyId);
    });
  });

  describe('DELETE /companies/:companyId', () => {
    let deleteCompanyId: number;

    beforeEach(async () => {
      const company = await createTestCompany({
        name: 'Company to Delete',
        companyCode: 'DELETE001',
      });
      deleteCompanyId = company.id;
    });

    it('should return 401 without token', async () => {
      const response = await request(app).delete(
        `/companies/${deleteCompanyId}`,
      );

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should return 403 when non-admin tries to delete company', async () => {
      const response = await request(app)
        .delete(`/companies/${deleteCompanyId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
    });

    it('should return 404 when deleting non-existent company', async () => {
      const response = await request(app)
        .delete('/companies/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });

    it('should successfully delete company as admin', async () => {
      const response = await request(app)
        .delete(`/companies/${deleteCompanyId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });
  });
});
