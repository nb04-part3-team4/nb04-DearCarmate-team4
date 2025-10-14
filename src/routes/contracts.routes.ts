import express, { Router } from 'express';
import { contractController } from '@/controllers/contracts.controller';
import { authMiddleware } from '@/middlewares/auth';
import { adminGuard } from '@/middlewares/admin-guard';

const router: Router = express.Router();

router.post('/contracts', authMiddleware, adminGuard, (req, res, next) =>
  contractController.createContract(req, res, next),
);
