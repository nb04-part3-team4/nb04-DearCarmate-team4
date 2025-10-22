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

      const result = await customerService.getCustomerById(customerId, companyId);

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