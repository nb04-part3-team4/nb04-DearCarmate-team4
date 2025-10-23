import { Request, Response, NextFunction } from 'express'; // NextFunction 추가
import { z } from 'zod';
import { Prisma } from '@prisma/client'; 
import { CreateCustomerDto, UpdateCustomerDto } from './customer.dto'; 
import * as CustomerService from './customer.service';

import { CustomError } from '@/shared/middlewares/custom-error'; 

type AuthenticatedRequest = Request & { user?: { companyId: number } };


// --- 1. 고객 등록 (POST /api/customers) ---
export const createCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.companyId; 
    
    // 401 에러를 CustomError로 던져서 에러 핸들러로 보낸다.
    if (!companyId) {
      throw new CustomError("인증 정보가 누락되었습니다.", 401);
    }

    const input = CreateCustomerDto.parse(req.body);
    
    const newCustomer = await CustomerService.createCustomerService(input, companyId);

    res.status(201).json({ message: '고객 정보 등록 성공', data: newCustomer });

  } catch (error) {
    next(error);
  }
};


// --- 2. 고객 목록 조회 (GET /api/customers) ---
export const getCustomers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            throw new CustomError("인증 정보가 누락되었습니다.", 401);
        }

        const customers = await CustomerService.getCustomersService(companyId);

        res.status(200).json({ data: customers, count: customers.length });

    } catch (error) {
        next(error);
    }
};

// --- 3. 특정 고객 조회 (GET /api/customers/:id) ---
export const getCustomerById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const companyId = req.user?.companyId;
        const customerId = parseInt(req.params.id);

        if (!companyId || isNaN(customerId)) {
            throw new CustomError("유효하지 않은 요청입니다.", 400);
        }

        const customer = await CustomerService.getCustomerByIdService(customerId, companyId);

        res.status(200).json({ data: customer });

    } catch (error) {
        
        if (error instanceof Error && error.message === 'Customer Not Found') {
            return next(new CustomError('해당 고객을 찾을 수 없습니다.', 404));
        }
        
        next(error); 
    }
};

// --- 4. 고객 정보 수정 (PUT /api/customers/:id) ---
export const updateCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const companyId = req.user?.companyId;
        const customerId = parseInt(req.params.id);

        if (!companyId || isNaN(customerId)) {
            throw new CustomError("유효하지 않은 요청입니다.", 400);
        }
        
        const input = UpdateCustomerDto.parse(req.body);

        const updatedCustomer = await CustomerService.updateCustomerService(customerId, companyId, input);

        res.status(200).json({ message: '고객 정보 수정 성공', data: updatedCustomer });

    } catch (error) {
        if (error instanceof Error && error.message === 'No Data to Update') {
             return next(new CustomError("수정할 데이터가 없습니다.", 400));
        }
        
        next(error); 
    }
};


// --- 5. 고객 정보 삭제 (DELETE /api/customers/:id) ---
export const deleteCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const companyId = req.user?.companyId;
        const customerId = parseInt(req.params.id);

        if (!companyId || isNaN(customerId)) {
            throw new CustomError("유효하지 않은 요청입니다.", 400);
        }

        await CustomerService.deleteCustomerService(customerId, companyId);

        res.status(204).json({ message: '고객 정보 삭제 성공' }); 

    } catch (error) {
        next(error); 
    }
};
