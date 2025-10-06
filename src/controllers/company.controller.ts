import { Request, Response, NextFunction } from 'express';
import { companyService } from '@/services/company.service';
import {
  createCompanySchema,
  companyQuerySchema,
} from '@/types/company.schema';
import { SuccessResponse } from '@/types/response';
import { BadRequestError } from '@/utils/custom-error';
import type {
  CreateCompanyResponseDto,
  GetCompaniesResponseDto,
  GetCompanyUsersResponseDto,
} from '@/dtos/company.dto';

export class CompanyController {
  async createCompany(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validatedData = createCompanySchema.parse(req.body);
      const result = await companyService.registerCompany(validatedData);

      const response: SuccessResponse<CreateCompanyResponseDto> = {
        status: 'success',
        data: result,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCompanies(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validatedQuery = companyQuerySchema.parse(req.query);
      const result = await companyService.getCompanies(validatedQuery);

      const response: SuccessResponse<GetCompaniesResponseDto[]> = {
        status: 'success',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCompanyUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const companyId = parseInt(req.params.companyId, 10);
      if (isNaN(companyId)) {
        throw new BadRequestError('Invalid company ID');
      }

      const result = await companyService.getUsersByCompanyId(companyId);

      const response: SuccessResponse<GetCompanyUsersResponseDto[]> = {
        status: 'success',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const companyController = new CompanyController();
