import express, { Router } from 'express';
import { contractController } from '@/features/contracts/contract.controller';
import { authMiddleware } from '@/shared/middlewares/auth';
import { adminGuard } from '@/shared/middlewares/admin-guard';

const router: Router = express.Router();

router.post('/', authMiddleware, (req, res, next) =>
  contractController.createContract(req, res, next),
);

router.get('/', authMiddleware, (req, res, next) =>
  contractController.getContracts(req, res, next),
);

router.patch('/:id', authMiddleware, (req, res, next) =>
  contractController.updateContract(req, res, next),
);

router.delete('/:id', authMiddleware, (req, res, next) =>
  contractController.deleteContract(req, res, next),
);

router.get('/users', authMiddleware, (req, res, next) =>
  contractController.getContractUsers(req, res, next),
);

router.get('/cars', authMiddleware, (req, res, next) =>
  contractController.getContractCars(req, res, next),
);

router.get('/customers', authMiddleware, (req, res, next) =>
  contractController.getContractCustomers(req, res, next),
);

export default router;