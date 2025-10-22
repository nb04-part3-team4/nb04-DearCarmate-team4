// src/features/customers/customer.controller.ts

import { Request, Response } from 'express';
import { z } from 'zod';
// Prisma Client 에러 타입에 접근하기 위해 import
import { Prisma } from '@prisma/client'; 
// DTO와 Service 모듈을 같은 features 폴더에서 가져옵니다.
import { CreateCustomerDto, UpdateCustomerDto } from './customer.dto'; 
import * as CustomerService from './customer.service';

// 인증 미들웨어를 통해 req.user에 companyId가 담겨 있다고 가정합니다.
type AuthenticatedRequest = Request & { user?: { companyId: number } };

// --- 1. 고객 등록 (POST /api/customers) ---
export const createCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId; 
    if (!companyId) return res.status(401).json({ message: "인증 정보가 누락되었습니다." });

    const input = CreateCustomerDto.parse(req.body);
    const newCustomer = await CustomerService.createCustomerService(input, companyId);

    res.status(201).json({ message: '고객 정보 등록 성공', data: newCustomer });

  } catch (error) {
    if (error instanceof z.ZodError) {
        // 🚀 최종 수정된 부분: 타입 단언(as z.ZodError)을 통해 TypeScript 오류 해결
        return res.status(400).json({ message: "입력 데이터 형식 오류", errors: (error as z.ZodError).errors });
    }
    console.error('고객 등록 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
};


// --- 2. 고객 목록 조회 (GET /api/customers) ---
export const getCustomers = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) return res.status(401).json({ message: "인증 정보가 누락되었습니다." });

        const customers = await CustomerService.getCustomersService(companyId);

        res.status(200).json({ data: customers, count: customers.length });

    } catch (error) {
        console.error('고객 목록 조회 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
};

// --- 3. 특정 고객 조회 (GET /api/customers/:id) ---
export const getCustomerById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        const customerId = parseInt(req.params.id);

        if (!companyId || isNaN(customerId)) return res.status(400).json({ message: "유효하지 않은 요청입니다." });

        const customer = await CustomerService.getCustomerByIdService(customerId, companyId);

        res.status(200).json({ data: customer });

    } catch (error) {
        // Service에서 던진 일반 Error를 확인하는 타입 가드
        if (error instanceof Error && error.message === 'Customer Not Found') {
            return res.status(404).json({ message: '해당 고객을 찾을 수 없습니다.' });
        }
        
        console.error('고객 상세 조회 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
};

// --- 4. 고객 정보 수정 (PUT /api/customers/:id) ---
export const updateCustomer = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        const customerId = parseInt(req.params.id);

        if (!companyId || isNaN(customerId)) return res.status(400).json({ message: "유효하지 않은 요청입니다." });
        
        const input = UpdateCustomerDto.parse(req.body);

        const updatedCustomer = await CustomerService.updateCustomerService(customerId, companyId, input);

        res.status(200).json({ message: '고객 정보 수정 성공', data: updatedCustomer });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "입력 데이터 형식 오류", errors: (error as z.ZodError).errors });
        }
        // Service에서 던진 Error 메시지를 확인
        if (error instanceof Error && error.message === 'No Data to Update') {
             return res.status(400).json({ message: "수정할 데이터가 없습니다." });
        }
        // Prisma Client 에러 (P2025: 레코드를 찾을 수 없음) 확인
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ message: '수정하려는 고객을 찾을 수 없습니다.' });
        }
        
        console.error('고객 정보 수정 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
};


// --- 5. 고객 정보 삭제 (DELETE /api/customers/:id) ---
export const deleteCustomer = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        const customerId = parseInt(req.params.id);

        if (!companyId || isNaN(customerId)) return res.status(400).json({ message: "유효하지 않은 요청입니다." });

        await CustomerService.deleteCustomerService(customerId, companyId);

        res.status(204).json({ message: '고객 정보 삭제 성공' }); 

    } catch (error) {
        // Prisma Client 에러 (P2025: 레코드를 찾을 수 없음) 확인
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') { 
            return res.status(404).json({ message: '삭제하려는 고객을 찾을 수 없습니다.' });
        }
        console.error('고객 정보 삭제 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
};