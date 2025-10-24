// src/features/customers/customer.router.ts

import { Router } from 'express';

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from './customer.controller'; 

import { authMiddleware } from '../../shared/middlewares/auth'; 

const router = Router();

router.get('/', authMiddleware, getCustomers); 
router.post('/', authMiddleware, createCustomer); 
router.get('/:id', authMiddleware, getCustomerById); 
router.put('/:id', authMiddleware, updateCustomer); 
router.delete('/:id', authMiddleware, deleteCustomer);

export default router;