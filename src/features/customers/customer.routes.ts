import { Router } from 'express';
import { customerController } from './customer.controller';
import { authMiddleware } from '@/shared/middlewares/auth';

const router = Router();

router
  .route('/')
  .get(authMiddleware, (req, res, next) =>
    customerController.getCustomers(req, res, next),
  )
  .post(authMiddleware, (req, res, next) =>
    customerController.createCustomer(req, res, next),
  );

router
  .route('/:id')
  .get(authMiddleware, (req, res, next) =>
    customerController.getCustomerById(req, res, next),
  )
  .put(authMiddleware, (req, res, next) =>
    customerController.updateCustomer(req, res, next),
  )
  .delete(authMiddleware, (req, res, next) =>
    customerController.deleteCustomer(req, res, next),
  );

export default router;