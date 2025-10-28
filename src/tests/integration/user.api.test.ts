import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@/app';
import { createTestCompany, createTestUser } from '../helpers/test-data';

describe('User API (E2E)', () => {
  let companyId: number;
  let companyCode: string;
  let accessToken: string;
  let userId: number;

  beforeEach(async () => {
    const company = await createTestCompany({
      name: 'User API Test Company',
      companyCode: 'USERAPI001',
    });
    companyId = company.id;
    companyCode = company.companyCode;

    // Create test user and login
    const userPassword = 'password123';
    const user = await createTestUser(companyId, {
      email: 'userapi@example.com',
      password: userPassword,
      name: 'User API Test',
      employeeNumber: 'EMPUSERAPI',
    });
    userId = user.id;

    const loginResponse = await request(app).post('/auth/login').send({
      email: user.email,
      password: userPassword,
    });

    accessToken = loginResponse.body.accessToken;
  });

  describe('POST /users (signup)', () => {
    it('should successfully create a new user with valid data', async () => {
      const response = await request(app).post('/users').send({
        email: 'newuser@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
        name: 'New User',
        employeeNumber: 'EMPNEW001',
        phoneNumber: '010-1234-5678',
        companyName: 'User API Test Company',
        companyCode: companyCode,
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe('newuser@example.com');
      expect(response.body.data.company.companyName).toBe(
        'User API Test Company',
      );
    });

    it('should return 400 with invalid company code', async () => {
      const response = await request(app).post('/users').send({
        email: 'invalid@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
        name: 'Invalid User',
        employeeNumber: 'EMPINV001',
        phoneNumber: '010-1234-5678',
        companyName: 'Invalid Company',
        companyCode: 'INVALID',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should return 409 with existing email', async () => {
      const response = await request(app).post('/users').send({
        email: 'userapi@example.com', // already exists
        password: 'password123',
        passwordConfirmation: 'password123',
        name: 'Duplicate User',
        employeeNumber: 'EMPDUP001',
        phoneNumber: '010-1234-5678',
        companyName: 'User API Test Company',
        companyCode: companyCode,
      });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /users/me', () => {
    it('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBe('userapi@example.com');
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/users/me');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

  describe('PATCH /users/me', () => {
    it('should successfully update user info', async () => {
      const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          phoneNumber: '010-9999-9999',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.phoneNumber).toBe('010-9999-9999');
    });

    it('should successfully update password with current password', async () => {
      const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'password123',
          password: 'newpassword123',
          passwordConfirmation: 'newpassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should return 400 with wrong current password', async () => {
      const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'wrongpassword',
          password: 'newpassword123',
          passwordConfirmation: 'newpassword123',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /users/me', () => {
    it('should successfully delete user account', async () => {
      const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);

      // Verify user cannot login anymore
      const loginResponse = await request(app).post('/auth/login').send({
        email: 'userapi@example.com',
        password: 'password123',
      });

      expect(loginResponse.status).toBe(401);
    });
  });
});
