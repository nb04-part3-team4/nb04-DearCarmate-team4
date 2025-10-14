import { contractRepository } from '@/repositories/contract.repository';
import { carRepository } from '@/repositories/car.repository';
import { customerRepository } from '@/repositories/customer.repository';
import { NotFoundError, ForbiddenError } from '@/utils/custom-error';
import { meetingRepository } from '@/repositories/meeting.repository';
import { alarmRepository } from '@/repositories/alarm.repository';
import { CreateContractDto, UpdateContractDto } from '@/types/contracts.schema';
import {
  ContractDetailResponseDto,
  GetContractsResponseDto,
  DeleteContractResponseDto,
} from '@/dtos/contract.dto';
import { userRepository } from '@/repositories/user.repository';
import prisma from '@/utils/prisma';
import { ContractWithRelations } from '@/types/contract.type';
import { ContractMapper } from '@/utils/contract.mapper';

export class ContractService {
  async createContract(
    validatedData: CreateContractDto,
    userId: number,
  ): Promise<ContractDetailResponseDto> {
    const { carId, customerId, meetings } = validatedData;

    const existingCar = await carRepository.findById(carId);
    if (!existingCar) {
      throw new NotFoundError('존재하지 않는 자동차입니다');
    }
    const existingCustomer = await customerRepository.findById(customerId);
    if (!existingCustomer) {
      throw new NotFoundError('존재하지 않는 고객입니다');
    }

    const contractPrice = existingCar.price;
    const companyId = existingCar.companyId;
    const contractName = 'TEMP';

    const finalContract = await prisma.$transaction(async (tx) => {
      const createdContract = await contractRepository.create(tx, {
        contractName,
        companyId,
        userId,
        carId,
        customerId,
        contractPrice,
      });

      if (meetings && meetings.length > 0) {
        for (const meeting of meetings) {
          const createdMeeting = await meetingRepository.create(tx, {
            contractId: createdContract.id,
            date: meeting.date,
          });

          if (meeting.alarms && meeting.alarms.length > 0) {
            const alarmPromises = meeting.alarms.map((alarmTime) =>
              alarmRepository.create(tx, {
                meetingId: createdMeeting.id,
                alarmTime: alarmTime,
              }),
            );
            await Promise.all(alarmPromises);
          }
        }
      }

      // 트랜잭션 일관성: 같은 tx 내에서 최종 조회
      const contractWithRelations = await contractRepository.findById(
        tx,
        createdContract.id,
      );

      if (!contractWithRelations) {
        throw new Error('계약 생성 후 정보 조회 실패: 트랜잭션 롤백');
      }
      return contractWithRelations;
    });

    // Single Responsibility: Mapper가 DTO 변환 담당
    return ContractMapper.toDetailDto(finalContract);
  }

  async updateContract(
    contractId: number,
    data: UpdateContractDto,
    requestUserId: number,
  ): Promise<ContractDetailResponseDto> {
    const { meetings, userId, customerId, carId, ...baseContractData } = data;

    const existingContract = await contractRepository.findById(
      prisma,
      contractId,
    );
    if (!existingContract) {
      throw new NotFoundError('존재하지 않는 계약입니다');
    }

    // 권한 검증: 담당자만 수정 가능
    if (existingContract.userId !== requestUserId) {
      throw new ForbiddenError('담당자만 수정이 가능합니다');
    }

    if (userId) {
      const existingUser = await userRepository.findById(userId);
      if (!existingUser) {
        throw new NotFoundError('존재하지 않는 담당자 ID입니다.');
      }
    }

    if (customerId) {
      const existingCustomer = await customerRepository.findById(customerId);
      if (!existingCustomer) {
        throw new NotFoundError('존재하지 않는 고객 ID입니다.');
      }
    }

    if (carId) {
      const existingCar = await carRepository.findById(carId);
      if (!existingCar) {
        throw new NotFoundError('존재하지 않는 차량 ID입니다.');
      }
    }

    const updatedContractDBResult = await prisma.$transaction(async (tx) => {
      await contractRepository.update(tx, contractId, {
        ...baseContractData,
        userId,
        customerId,
        carId,
      });
      if (meetings !== undefined) {
        await meetingRepository.deleteManyByContractId(tx, contractId);
        for (const meeting of meetings) {
          const createdMeeting = await meetingRepository.create(tx, {
            contractId: contractId,
            date: meeting.date,
          });

          if (meeting.alarms && meeting.alarms.length > 0) {
            const alarmPromises = meeting.alarms.map((alarmTime) =>
              alarmRepository.create(tx, {
                meetingId: createdMeeting.id,
                alarmTime: alarmTime,
              }),
            );
            await Promise.all(alarmPromises);
          }
        }
      }

      // 트랜잭션 일관성: 같은 tx 내에서 최종 조회
      const finalContract = await contractRepository.findById(tx, contractId);
      if (!finalContract) {
        throw new Error('업데이트 후 계약 정보를 찾을 수 없습니다.');
      }

      return finalContract;
    });

    return ContractMapper.toDetailDto(updatedContractDBResult);
  }

  async getContracts(
    companyId: number,
    searchBy?: 'customerName' | 'userName',
    keyword?: string,
  ): Promise<GetContractsResponseDto> {
    const contracts = await contractRepository.findAllByCompanyId(
      companyId,
      searchBy,
      keyword,
    );

    // 상태별로 그룹화
    const groupedContracts: Record<string, ContractWithRelations[]> = {
      carInspection: [],
      priceNegotiation: [],
      contractDraft: [],
      contractSuccessful: [],
      contractFailed: [],
    };

    contracts.forEach((contract) => {
      if (groupedContracts[contract.status]) {
        groupedContracts[contract.status].push(contract);
      }
    });

    return {
      carInspection: {
        totalItemCount: groupedContracts.carInspection.length,
        data: groupedContracts.carInspection.map((c) =>
          ContractMapper.toListItemDto(c),
        ),
      },
      priceNegotiation: {
        totalItemCount: groupedContracts.priceNegotiation.length,
        data: groupedContracts.priceNegotiation.map((c) =>
          ContractMapper.toListItemDto(c),
        ),
      },
      contractDraft: {
        totalItemCount: groupedContracts.contractDraft.length,
        data: groupedContracts.contractDraft.map((c) =>
          ContractMapper.toListItemDto(c),
        ),
      },
      contractSuccessful: {
        totalItemCount: groupedContracts.contractSuccessful.length,
        data: groupedContracts.contractSuccessful.map((c) =>
          ContractMapper.toListItemDto(c),
        ),
      },
      contractFailed: {
        totalItemCount: groupedContracts.contractFailed.length,
        data: groupedContracts.contractFailed.map((c) =>
          ContractMapper.toListItemDto(c),
        ),
      },
    };
  }

  async deleteContract(
    contractId: number,
    requestUserId: number,
  ): Promise<DeleteContractResponseDto> {
    const existingContract = await contractRepository.findById(
      prisma,
      contractId,
    );
    if (!existingContract) {
      throw new NotFoundError('존재하지 않는 계약입니다');
    }

    // 권한 검증: 담당자만 삭제 가능
    if (existingContract.userId !== requestUserId) {
      throw new ForbiddenError('담당자만 삭제가 가능합니다');
    }

    await contractRepository.delete(contractId);

    return {
      message: '계약 삭제 성공',
    };
  }
}

export const contractService = new ContractService();
