import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@/app';
import { createTestCompany, createTestUser } from '../helpers/test-data';

describe('Auth API (E2E)', () => {
  let companyId: number;
  let userEmail: string;
  let userPassword: string;

  beforeEach(async () => {
    const company = await createTestCompany({
      name: 'Auth API Test Company',
      companyCode: 'AUTHAPI001',
    });
    companyId = company.id;

    userEmail = 'authapi@example.com';
    userPassword = 'password123';

    await createTestUser(companyId, {
      email: userEmail,
      password: userPassword,
      name: 'Auth API User',
      employeeNumber: 'EMPAUTH001',
    });
  });

  describe('POST /auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const response = await request(app).post('/auth/login').send({
        email: userEmail,
        password: userPassword,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(userEmail);
      expect(response.body.user.company.companyName).toBe(
        'Auth API Test Company',
      );
    });

    it('should return 401 with invalid email', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'wrong@example.com',
        password: userPassword,
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should return 401 with invalid password', async () => {
      const response = await request(app).post('/auth/login').send({
        email: userEmail,
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should return 400 with missing fields', async () => {
      const response = await request(app).post('/auth/login').send({
        email: userEmail,
        // password missing
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should successfully refresh access token with valid refresh token', async () => {
      // First login to get refresh token
      const loginResponse = await request(app).post('/auth/login').send({
        email: userEmail,
        password: userPassword,
      });

      const { refreshToken } = loginResponse.body;

      // Then refresh
      const refreshResponse = await request(app).post('/auth/refresh').send({
        refreshToken,
      });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body).toHaveProperty('accessToken');
      expect(refreshResponse.body).toHaveProperty('refreshToken');
    });

    it('should return 401 with invalid refresh token', async () => {
      const response = await request(app).post('/auth/refresh').send({
        refreshToken: 'invalid.token.here',
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });
});
