import {
  createTestCar,
  createTestCompany,
  createTestUser,
} from '../helpers/test-data.js';
import request from 'supertest';
import app from '@/app';

describe('Car API', () => {
  let companyId: number;
  let userToken: string;
  let carId: number;

  beforeEach(async () => {
    const company = await createTestCompany({
      name: 'Car API Test Company',
      companyCode: 'CARAPI001',
    });
    companyId = company.id;

    const car = await createTestCar(companyId, { carNumber: '12가1234' });
    carId = car.id;

    // Create regular user
    const userPassword = 'password123';
    const regularUser = await createTestUser(companyId, {
      email: 'regular@example.com',
      name: 'Regular User',
      employeeNumber: 'EMPREG001',
      isAdmin: false,
    });

    // Login as regular user
    const userLoginResponse = await request(app).post('/auth/login').send({
      email: regularUser.email,
      password: userPassword,
    });
    userToken = userLoginResponse.body.accessToken;
  });

  describe('POST /cars', () => {
    const carData = {
      carNumber: '12가1235',
      manufacturer: '기아',
      model: 'K5',
      manufacturingYear: 2020,
      mileage: 30,
      price: 1000000,
      accidentCount: 1,
      explanation: '테스트 사고',
      accidentDetails: '테스트 차량 사고 내용입니다',
    };
    it('should return 401 witout token', async () => {
      const response = await request(app).post('/cars').send(carData);
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
    it('should return 400 with invalid data', async () => {
      const response = await request(app)
        .post('/cars')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          carNumber: 'invalid',
        });
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
    it('should uccessfully create a car', async () => {
      const response = await request(app)
        .post('/cars')
        .set('Authorization', `Bearer ${userToken}`)
        .send(carData);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.carNumber).toBe(carData.carNumber);
      expect(response.body.manufacturer).toBe(carData.manufacturer);
      expect(response.body.model).toBe(carData.model);
      expect(response.body.type).toBe('세단');
      expect(response.body.manufacturingYear).toBe(carData.manufacturingYear);
      expect(response.body.mileage).toBe(carData.mileage);
      expect(response.body.price).toBe(carData.price);
      expect(response.body.accidentCount).toBe(carData.accidentCount);
      expect(response.body.explanation).toBe(carData.explanation);
      expect(response.body.accidentDetails).toBe(carData.accidentDetails);
      expect(response.body.status).toBe('possession');
    });
  });
  describe('GET /cars', () => {
    beforeEach(async () => {
      // Create additional cars for pagination test
      await createTestCar(companyId, { carNumber: '12가1236' });
      await createTestCar(companyId, { carNumber: '12가1237' });
    });
    it('should return 401 witout token', async () => {
      const response = await request(app).get('/cars');
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
    it('should successfully get cars list', async () => {
      const response = await request(app)
        .get('/cars')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.currentPage).toBeDefined();
      expect(response.body.totalPages).toBeDefined();
      expect(response.body.totalItemCount).toBeGreaterThan(0);
    });
    it('should support pagination', async () => {
      const response = await request(app)
        .get('/cars?page=1&pageSize=2')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.currentPage).toBe(1);
    });
    it('should support search by carNumber', async () => {
      const response = await request(app)
        .get('/cars?searchBy=carNumber&keyword=12가1234')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
    it('should support search by model', async () => {
      const response = await request(app)
        .get('/cars?searchBy=model&keyword=K5')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
    it('should filter cars by status', async () => {
      const response = await request(app)
        .get('/cars?status=possession')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });
  describe('GET /cars/:carId', () => {
    it('should return 401 witout token', async () => {
      const response = await request(app).get(`/cars/${carId}`);
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
    it('should return 400 with invalid carId', async () => {
      const response = await request(app)
        .get(`/cars/invalid`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
    it('should return 404 when updating non-existent car', async () => {
      const response = await request(app)
        .get('/cars/99999')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
    it('should successfully get car', async () => {
      const response = await request(app)
        .get(`/cars/${carId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBeDefined();
      expect(response.body.carNumber).toBe('12가1234');
      expect(response.body.manufacturer).toBe('기아');
      expect(response.body.model).toBe('K5');
      expect(response.body.type).toBe('세단');
      expect(response.body.manufacturingYear).toBe(2020);
      expect(response.body.mileage).toBe(0);
      expect(response.body.price).toBe(1000000);
      expect(response.body.accidentCount).toBe(0);
      expect(response.body.explanation).toBe('');
      expect(response.body.accidentDetails).toBe('');
      expect(response.body.status).toBe('possession');
    });
  });
  describe('PATCH /cars/:carId', () => {
    it('should return 401 witout token', async () => {
      const response = await request(app).patch(`/cars/${carId}`);
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
    it('should return 400 with invalid carId', async () => {
      const response = await request(app)
        .patch(`/cars/invalid`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ accidentDetails: 'test' });
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
    it('should return 400 with invalid carModel', async () => {
      const response = await request(app)
        .patch(`/cars/${carId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ model: 123 });
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
    it('should return 404 when updating non-existent car', async () => {
      const response = await request(app)
        .patch('/cars/99999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          accidentCount: 1,
          explanation: 'invalid id',
          accidentDetails: 'invalid id Details',
        });
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
    it('should successfully update car', async () => {
      const response = await request(app)
        .patch(`/cars/${carId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          accidentCount: 1,
          explanation: 'Update Accident',
          accidentDetails: 'UPDATE AccidentDetails',
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBeDefined();
      expect(response.body.carNumber).toBe('12가1234');
      expect(response.body.manufacturer).toBe('기아');
      expect(response.body.model).toBe('K5');
      expect(response.body.type).toBe('세단');
      expect(response.body.manufacturingYear).toBe(2020);
      expect(response.body.mileage).toBe(0);
      expect(response.body.price).toBe(1000000);
      expect(response.body.accidentCount).toBe(1);
      expect(response.body.explanation).toBe('Update Accident');
      expect(response.body.accidentDetails).toBe('UPDATE AccidentDetails');
      expect(response.body.status).toBe('possession');
    });
  });
  describe('DELETE /cars/:carId', () => {
    let deleteCarId: number;
    beforeEach(async () => {
      const car = await createTestCar(companyId, {
        carNumber: '34가1234',
      });
      deleteCarId = car.id;
    });
    it('should return 401 witout token', async () => {
      const response = await request(app).delete(`/cars/${deleteCarId}`);
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
    it('should return 400 with invalid carId', async () => {
      const response = await request(app)
        .delete(`/cars/invalid`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
    it('should return 404 when delete non-existent car', async () => {
      const response = await request(app)
        .delete('/cars/99999')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
    it('should successfully delete car', async () => {
      const response = await request(app)
        .delete(`/cars/${deleteCarId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });
  });
  describe('GET /cars/models', () => {
    it('should return 401 witout token', async () => {
      const response = await request(app).get(`/cars/models`);
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
    it('should successfully get car models', async () => {
      const response = await request(app)
        .get(`/cars/models`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
  describe('POST /cars/upload', () => {
    it('should return 401 witout token', async () => {
      const response = await request(app).post(`/cars/upload`);
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
    it('should return an error if the CSV contains invalid car numbers', async () => {
      const response = await request(app)
        .post('/cars/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach(
          'file',
          'src/tests/helpers/test-files/test-invalid-id-cars.csv',
        );

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
    });
    it('should return an error if the CSV contains invalid car models', async () => {
      const response = await request(app)
        .post('/cars/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach(
          'file',
          'src/tests/helpers/test-files/test-invalid-model-cars.csv',
        );

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
    it('should successfully upload a CSV file and create cars', async () => {
      const response = await request(app)
        .post('/cars/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', 'src/tests/helpers/test-files/test-cars.csv');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('성공적으로 등록되었습니다.');
    });
  });
});
