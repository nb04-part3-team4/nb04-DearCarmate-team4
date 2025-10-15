import express from 'express';
import CarController from '@/controllers/cars.controller';
import { authMiddleware } from '@/middlewares/auth';
import { uploadCsv } from '@/middlewares/multer.js';
import { carsCsvParser } from '@/middlewares/cars-csv-parser.js';

const carRouter = express.Router();

carRouter
  .route('/')
  .get(authMiddleware, CarController.getCars)
  .post(authMiddleware, CarController.createCar);

carRouter
  .route('/upload')
  .post(
    authMiddleware,
    uploadCsv.single('file'),
    carsCsvParser,
    CarController.uploadCars,
  );

carRouter.route('/models').get(authMiddleware, CarController.getCarModels);

carRouter
  .route('/:carId')
  .get(authMiddleware, CarController.getCar)
  .patch(authMiddleware, CarController.updateCar)
  .delete(authMiddleware, CarController.deleteCar);

export default carRouter;
