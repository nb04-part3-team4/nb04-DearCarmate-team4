import { Request, Response, NextFunction } from 'express';
import { contractService } from '@/services/contract.service';
import { createContractSchema } from '@/types/contracts.schema';
import { updateContractSchema } from '@/types/contracts.schema';
import { UpdateContractRequestDto } from '@/dtos/contract.dto';
import { BadRequestError, UnauthorizedError } from '@/utils/custom-error';

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
        throw new BadRequestError('유효하지 않은 계약 ID입니다.');
      }

      if (!req.user || !req.user.userId) {
        throw new UnauthorizedError('사용자 인증 정보가 누락되었습니다.');
      }

      const validatedData = updateContractSchema.parse(
        req.body,
      ) as UpdateContractRequestDto;

      const responseDto = await contractService.updateContract(
        contractId,
        validatedData,
      );
      res.status(200).json(responseDto);
    } catch (error) {
      next(error);
    }
  }
}

export const contractController = new ContractController();
