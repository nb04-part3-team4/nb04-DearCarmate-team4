import express from 'express';
import { getDashboard } from './dashboard.controller.js';
import { authMiddleware } from '@/shared/middlewares/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getDashboard);

export default router;
