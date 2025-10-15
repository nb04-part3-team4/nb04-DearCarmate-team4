import { RequestHandler } from 'express';
import CarService from '@/services/cars.service.js';
import { BadRequestError } from '@/middlewares/custom-error.js';
import { requireAuth } from '@/middlewares/auth-guard.js';
import { carsBodySchema, carsQuerySchema } from '@/types/cars.schema.js';

class CarController {
  getCar: RequestHandler = async (req, res, next) => {
    try {
      requireAuth(req);
      const carId = parseInt(req.params.carId, 10);
      if (isNaN(carId)) {
        throw new BadRequestError('잘못된 요청입니다');
      }
      const result = await CarService.getCar({ carId });
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  };
  getCars: RequestHandler = async (req, res, next) => {
    try {
      requireAuth(req);
      const validatedQuery = carsQuerySchema.parse(req.query);
      const result = await CarService.getCars(validatedQuery);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  };
  createCar: RequestHandler = async (req, res, next) => {
    try {
      requireAuth(req);
      const { userId } = req.user;
      const validatedBody = carsBodySchema.parse(req.body);
      const result = await CarService.createCar({
        userId,
        data: validatedBody,
      });
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  };
  updateCar: RequestHandler = async (req, res, next) => {
    try {
      requireAuth(req);
      const carId = parseInt(req.params.carId, 10);
      if (isNaN(carId)) {
        throw new BadRequestError('잘못된 요청입니다');
      }
      const validateBody = carsBodySchema.partial().parse(req.body);
      const result = await CarService.updateCar({
        carId,
        data: validateBody,
      });
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  };
  deleteCar: RequestHandler = async (req, res, next) => {
    try {
      requireAuth(req);
      const carId = parseInt(req.params.carId, 10);
      if (isNaN(carId)) {
        throw new BadRequestError('잘못된 요청입니다');
      }
      await CarService.deleteCar({ carId });
      res.status(200).json({ message: '차량 삭제 성공' });
    } catch (e) {
      next(e);
    }
  };
  getCarModels: RequestHandler = async (req, res, next) => {
    try {
      requireAuth(req);
      const result = await CarService.getCarModels();
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  };
  uploadCars: RequestHandler = async (req, res, next) => {
    try {
      requireAuth(req);
      const carDatas = req.parsedCsvData;
      if (!carDatas) {
        throw new BadRequestError('잘못된 요청입니다');
      }
      const { userId } = req.user;
      await CarService.uploadCars({ userId, data: carDatas });
      return res.status(200).json({ message: '성공적으로 등록되었습니다.' });
    } catch (e) {
      next(e);
    }
  };
}

export default new CarController();
