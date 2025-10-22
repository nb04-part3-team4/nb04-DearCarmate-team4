import { Request, Response, NextFunction } from 'express'; // NextFunction 추가
import { z } from 'zod';
import { Prisma } from '@prisma/client'; 
import { CreateCustomerDto, UpdateCustomerDto } from './customer.dto'; 
import * as CustomerService from './customer.service';

// ⚠️ 팀의 실제 경로에 맞게 임포트해야 합니다. (예: '../../shared/middlewares/custom-error')
// 팀의 errorHandler.ts를 참고하여 CustomError 클래스만 임포트합니다.
import { CustomError } from '@/shared/middlewares/custom-error'; 

// 인증 미들웨어를 통해 req.user에 companyId가 담겨 있다고 가정합니다.
type AuthenticatedRequest = Request & { user?: { companyId: number } };


// --- 1. 고객 등록 (POST /api/customers) ---
export const createCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.companyId; 
    
    // 401 에러를 CustomError로 던져서 에러 핸들러로 보냅니다.
    if (!companyId) {
      throw new CustomError("인증 정보가 누락되었습니다.", 401);
    }

    // ZodError는 중앙 에러 핸들러에서 직접 처리하므로, 여기서는 throw만 합니다.
    const input = CreateCustomerDto.parse(req.body);
    
    const newCustomer = await CustomerService.createCustomerService(input, companyId);

    res.status(201).json({ message: '고객 정보 등록 성공', data: newCustomer });

  } catch (error) {
    // ZodError와 CustomError, PrismaError 등 모든 에러를 next()로 위임합니다.
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

        // 400 에러 (Bad Request)를 CustomError로 던집니다.
        if (!companyId || isNaN(customerId)) {
            throw new CustomError("유효하지 않은 요청입니다.", 400);
        }

        const customer = await CustomerService.getCustomerByIdService(customerId, companyId);

        res.status(200).json({ data: customer });

    } catch (error) {
        // Service에서 던진 'Customer Not Found' Error를 404 CustomError로 변환합니다.
        if (error instanceof Error && error.message === 'Customer Not Found') {
            return next(new CustomError('해당 고객을 찾을 수 없습니다.', 404));
        }
        
        // Prisma P2025 에러도 중앙 핸들러가 처리하지만, 명시적인 CustomError를 던질 수도 있습니다.
        // 여기서는 Service Layer에서 발생한 일반 에러만 next()로 위임합니다.
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
        
        // ZodError는 중앙 에러 핸들러가 처리하므로 throw만 합니다.
        const input = UpdateCustomerDto.parse(req.body);

        const updatedCustomer = await CustomerService.updateCustomerService(customerId, companyId, input);

        res.status(200).json({ message: '고객 정보 수정 성공', data: updatedCustomer });

    } catch (error) {
        // Service에서 던진 'No Data to Update' Error를 400 CustomError로 변환합니다.
        if (error instanceof Error && error.message === 'No Data to Update') {
             return next(new CustomError("수정할 데이터가 없습니다.", 400));
        }
        
        // Prisma P2025 에러는 중앙 핸들러에서 404로 자동 처리됩니다.
        // ZodError도 중앙에서 400으로 자동 처리됩니다.
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
        // Prisma P2025 에러는 중앙 핸들러에서 404로 자동 처리됩니다.
        next(error); 
    }
};
