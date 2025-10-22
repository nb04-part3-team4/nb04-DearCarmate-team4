// src/features/customers/customer.router.ts

import { Router } from 'express';
// 👈 같은 폴더 내의 controller를 참조하도록 경로 수정
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from './customer.controller'; 

// TODO: 실제 프로젝트의 인증 미들웨어 경로로 변경해야 합니다.
import { authMiddleware } from '../../shared/middlewares/auth';

const router = Router();

// ... (Swagger 주석은 생략하고 실제 라우팅 코드만 보여드립니다.)

router.get('/', authMiddleware, getCustomers); 
router.post('/', authMiddleware, createCustomer); 
router.get('/:id', authMiddleware, getCustomerById); 
router.put('/:id', authMiddleware, updateCustomer); 
router.delete('/:id', authMiddleware, deleteCustomer);

export default router;