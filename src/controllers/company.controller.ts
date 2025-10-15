import { Request, Response, NextFunction } from 'express';
import { companyService } from '@/services/company.service';
import {
  createCompanySchema,
  companyQuerySchema,
  updateCompanySchema,
  companyUsersQuerySchema,
} from '@/types/company.schema';
import { BadRequestError } from '@/middlewares/custom-error';

export class CompanyController {
  async createCompany(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validatedData = createCompanySchema.parse(req.body);
      const result = await companyService.registerCompany(validatedData);

      res.status(201).json(result);
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

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateCompany(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const companyId = parseInt(req.params.companyId, 10);
      if (isNaN(companyId)) {
        throw new BadRequestError('잘못된 요청입니다');
      }

      const validatedData = updateCompanySchema.parse(req.body);
      const result = await companyService.updateCompany(
        companyId,
        validatedData,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteCompany(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const companyId = parseInt(req.params.companyId, 10);
      if (isNaN(companyId)) {
        throw new BadRequestError('잘못된 요청입니다');
      }

      await companyService.deleteCompany(companyId);

      res.status(200).json({ message: '회사 삭제 성공' });
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
      const validatedQuery = companyUsersQuerySchema.parse(req.query);
      const result = await companyService.getUsersByCompanyId(validatedQuery);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const companyController = new CompanyController();
