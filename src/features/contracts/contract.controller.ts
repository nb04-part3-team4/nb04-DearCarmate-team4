import { Request, Response, NextFunction } from 'express';
import { contractService } from '@/features/contracts/contract.service';
import { userService } from '@/features/users/user.service';
import { customerService } from '@/features/customers/customer.service';
import carService from '@/features/cars/cars.service';
import {
  createContractSchema,
  updateContractSchema,
} from '@/features/contracts/contract.schema';
import {
  BadRequestError,
  UnauthorizedError,
} from '@/shared/middlewares/custom-error';
export class ContractController {
  async createContract(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validatedData = createContractSchema.parse(req.body);
      if (!req.user || !req.user.userId) {
        throw new UnauthorizedError('사용자 인증 정보가 누락되었습니다.');
      }
      const userId = req.user.userId;
      const result = await contractService.createContract(
        validatedData,
        userId,
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateContract(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const contractId = parseInt(req.params.id);
      if (isNaN(contractId) || contractId <= 0) {
        throw new BadRequestError('잘못된 요청입니다');
      }

      if (!req.user || !req.user.userId) {
        throw new UnauthorizedError('로그인이 필요합니다');
      }

      const validatedData = updateContractSchema.parse(req.body);

      const responseDto = await contractService.updateContract(
        contractId,
        validatedData,
        req.user.userId,
      );
      res.status(200).json(responseDto);
    } catch (error) {
      next(error);
    }
  }

  async getContracts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user || !req.user.companyId) {
        throw new UnauthorizedError('로그인이 필요합니다');
      }

      const { searchBy, keyword } = req.query;

      // searchBy 검증
      if (searchBy && searchBy !== 'customerName' && searchBy !== 'userName') {
        throw new BadRequestError('잘못된 요청입니다');
      }

      const responseDto = await contractService.getContracts(
        req.user.companyId,
        searchBy as 'customerName' | 'userName' | undefined,
        keyword as string | undefined,
      );

      res.status(200).json(responseDto);
    } catch (error) {
      next(error);
    }
  }

  async deleteContract(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const contractId = parseInt(req.params.id);
      if (isNaN(contractId) || contractId <= 0) {
        throw new BadRequestError('잘못된 요청입니다');
      }

      if (!req.user || !req.user.userId) {
        throw new UnauthorizedError('로그인이 필요합니다');
      }

      const responseDto = await contractService.deleteContract(
        contractId,
        req.user.userId,
      );

      res.status(200).json(responseDto);
    } catch (error) {
      next(error);
    }
  }

  async getContractUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw new UnauthorizedError('로그인이 필요합니다');
      }
      const users = await userService.getUsersForContract();

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async getContractCustomers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user || !req.user.companyId) {
        throw new UnauthorizedError('로그인이 필요합니다');
      }
      const customers = await customerService.getCustomersForContract(
        req.user.companyId,
      );
      res.status(200).json(customers);
    } catch (error) {
      next(error);
    }
  }
  async getContractCars(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw new UnauthorizedError('로그인이 필요합니다');
      }
      const cars = await carService.getCarsForContract();

      res.status(200).json(cars);
    } catch (error) {
      next(error);
    }
  }
}

export const contractController = new ContractController();
