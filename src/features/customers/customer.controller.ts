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
import { Request, Response, NextFunction } from 'express';
import { customerService } from './customer.service';
import { createCustomerSchema, updateCustomerSchema } from './customer.schema';
import { SuccessResponse } from '@/shared/types/response';
import { requireAuth } from '@/shared/middlewares/auth-guard';
import { BadRequestError } from '@/shared/middlewares/custom-error';
import type {
  CreateCustomerResponseDto,
  GetCustomersResponseDto,
  GetCustomerResponseDto,
  UpdateCustomerResponseDto,
} from './customer.dto';

export class CustomerController {
  async createCustomer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      requireAuth(req);
      const { companyId } = req.user;
      const validatedData = createCustomerSchema.parse(req.body);

      const result = await customerService.createCustomer(
        companyId,
        validatedData,
      );

      const response: SuccessResponse<CreateCustomerResponseDto> = {
        status: 'success',
        data: result,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCustomers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      requireAuth(req);
      const { companyId } = req.user;

      const result = await customerService.getCustomers(companyId);

      const response: SuccessResponse<GetCustomersResponseDto> = {
        status: 'success',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      requireAuth(req);
      const { companyId } = req.user;
      const customerId = parseInt(req.params.id, 10);
      if (isNaN(customerId)) {
        throw new BadRequestError('잘못된 고객 ID입니다.');
      }

      const result = await customerService.getCustomerById(
        customerId,
        companyId,
      );

      const response: SuccessResponse<GetCustomerResponseDto> = {
        status: 'success',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      requireAuth(req);
      const { companyId } = req.user;
      const customerId = parseInt(req.params.id, 10);
      if (isNaN(customerId)) {
        throw new BadRequestError('잘못된 고객 ID입니다.');
      }

      const validatedData = updateCustomerSchema.parse(req.body);
      const result = await customerService.updateCustomer(
        customerId,
        companyId,
        validatedData,
      );

      const response: SuccessResponse<UpdateCustomerResponseDto> = {
        status: 'success',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteCustomer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      requireAuth(req);
      const { companyId } = req.user;
      const customerId = parseInt(req.params.id, 10);
      if (isNaN(customerId)) {
        throw new BadRequestError('잘못된 고객 ID입니다.');
      }

      await customerService.deleteCustomer(customerId, companyId);

      res.status(200).json({ status: 'success', message: '고객 삭제 성공' });
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
