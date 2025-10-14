// src/routes/customer.router.ts

import { Router } from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller';

// TODO: 실제 프로젝트의 인증 미들웨어 경로로 변경해야 합니다.
import { authenticate } from '../middlewares/auth.middleware'; 

const router = Router();

// 모든 고객 관련 API는 인증된 사용자만 접근 가능하도록 미들웨어를 적용합니다.
// 미들웨어(authenticate)는 req.user에 companyId를 넣어준다고 가정합니다.

// GET /api/customers - 고객 목록 조회
router.get('/', authenticate, getCustomers); 

// POST /api/customers - 새 고객 등록
router.post('/', authenticate, createCustomer); 

// GET /api/customers/:id - 특정 고객 상세 조회
router.get('/:id', authenticate, getCustomerById); 

// PUT /api/customers/:id - 고객 정보 수정
router.put('/:id', authenticate, updateCustomer); 

// DELETE /api/customers/:id - 고객 정보 삭제
router.delete('/:id', authenticate, deleteCustomer);

export default router;