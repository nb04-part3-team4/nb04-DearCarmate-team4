// src/features/customers/customer.router.ts

import { Router } from 'express';
// 같은 폴더 내의 controller를 참조합니다.
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from './customer.controller'; 

// 팀의 정확한 인증 미들웨어 경로와 함수 이름을 사용합니다.
import { authMiddleware } from '../../shared/middlewares/auth'; 

const router = Router();

// 참고: Swagger 주석은 여기서 생략되었습니다.

router.get('/', authMiddleware, getCustomers); 
router.post('/', authMiddleware, createCustomer); 
router.get('/:id', authMiddleware, getCustomerById); 
router.put('/:id', authMiddleware, updateCustomer); 
router.delete('/:id', authMiddleware, deleteCustomer);

export default router;