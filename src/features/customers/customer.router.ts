// src/features/customers/customer.router.ts

import { Router } from 'express';
import { customerController } from './customer.controller';
import { authMiddleware } from '../../shared/middlewares/auth';

const router = Router();

router.get('/', authMiddleware, (req, res, next) =>
  customerController.getCustomers(req, res, next),
);
router.post('/', authMiddleware, (req, res, next) =>
  customerController.createCustomer(req, res, next),
);
router.get('/:id', authMiddleware, (req, res, next) =>
  customerController.getCustomerById(req, res, next),
);
router.put('/:id', authMiddleware, (req, res, next) =>
  customerController.updateCustomer(req, res, next),
);
router.delete('/:id', authMiddleware, (req, res, next) =>
  customerController.deleteCustomer(req, res, next),
);

export default router;
