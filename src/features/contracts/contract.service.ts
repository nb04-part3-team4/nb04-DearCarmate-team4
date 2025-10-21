import { contractRepository } from '@/features/contracts/contract.repository';
import CarRepository from '@/features/cars/cars.repository';
import {
  NotFoundError,
  ForbiddenError,
} from '@/shared/middlewares/custom-error';
import { meetingRepository } from '@/features/contracts/meeting.repository';
import { alarmRepository } from '@/features/contracts/alarm.repository';
import {
  CreateContractDto,
  UpdateContractDto,
} from '@/features/contracts/contract.schema';
import {
  ContractDetailResponseDto,
  GetContractsResponseDto,
  DeleteContractResponseDto,
} from '@/features/contracts/contract.dto';
import { userRepository } from '@/features/users/user.repository';
import prisma from '@/shared/middlewares/prisma';
import { ContractWithRelations } from '@/features/contracts/contract.type';
import { ContractMapper } from '@/features/contracts/contract.mapper';
import { customerRepository } from '../customers/customer.repository';

export class ContractService {
  private static readonly NEXT_STATUS: Record<string, string> = {
    carInspection: 'priceNegotiation',
    priceNegotiation: 'contractDraft',
  };

  async createContract(
    validatedData: CreateContractDto,
    userId: number,
  ): Promise<ContractDetailResponseDto> {
    const { carId, customerId, meetings } = validatedData;

    const existingCar = await CarRepository.findById({ carId });
    if (!existingCar) {
      throw new NotFoundError('존재하지 않는 자동차입니다');
    }
    const existingCustomer = await customerRepository.findById(customerId);
    if (!existingCustomer) {
      throw new NotFoundError('존재하지 않는 고객입니다');
    }

    const contractPrice = existingCar.price;
    const companyId = existingCar.companyId;

    const contractName = `${existingCar.modelId} - ${existingCustomer.name} 고객님`;

    const finalContract = await prisma.$transaction(async (tx) => {
      const createdContract = await contractRepository.create(tx, {
        companyId,
        userId,
        carId,
        customerId,
        contractPrice,
        contractName,
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
    const { meetings, userId, customerId, carId, status, ...baseContractData } =
      data;

    const existingContract = await contractRepository.findById(
      prisma,
      contractId,
    );

    if (!existingContract) {
      throw new NotFoundError('존재하지 않는 계약입니다');
    }

    if (existingContract.userId !== requestUserId) {
      throw new ForbiddenError('담당자만 수정이 가능합니다');
    }

    const isOnlyStatusUpdate =
      status !== undefined &&
      Object.keys(baseContractData).length === 0 &&
      !meetings &&
      userId === undefined &&
      customerId === undefined &&
      carId === undefined;

    if (isOnlyStatusUpdate) {
      await contractRepository.update(prisma, contractId, { status: status });

      const updatedContract = await contractRepository.findById(
        prisma,
        contractId,
      );

      if (!updatedContract) {
        throw new Error('상태 업데이트 후 계약 정보를 찾을 수 없습니다.');
      }
      return ContractMapper.toDetailDto(updatedContract);
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
      const existingCar = await CarRepository.findById({ carId });
      if (!existingCar) {
        throw new NotFoundError('존재하지 않는 차량 ID입니다.');
      }
    }
    let newContractName: string = '';

    if (carId && customerId) {
      const car = await CarRepository.findById({ carId });
      const customer = await customerRepository.findById(customerId);

      if (!car || !customer) {
        throw new NotFoundError('차량 또는 고객 정보를 찾을 수 없습니다.');
      }
      newContractName = `${car.modelId} - ${customer.name} 고객님`;
    }
    const updatedContractDBResult = await prisma.$transaction(async (tx) => {
      await contractRepository.update(tx, contractId, {
        ...baseContractData,
        userId,
        customerId,
        carId,
        ...(status !== undefined && { status }),
        contractName: newContractName,
      });
      if (meetings !== undefined) {
        await meetingRepository.deleteManyByContractId(tx, contractId);
        for (const meeting of meetings) {
          const createdMeeting = await meetingRepository.create(tx, {
            contractId,
            date: meeting.date,
          });
          if (meeting.alarms && meeting.alarms.length > 0) {
            const alarmPromises = meeting.alarms.map((alarmTime) =>
              alarmRepository.create(tx, {
                meetingId: createdMeeting.id,
                alarmTime,
              }),
            );
            await Promise.all(alarmPromises);
          }
        }
      }
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
