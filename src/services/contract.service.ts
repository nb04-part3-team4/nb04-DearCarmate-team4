import { contractRepository } from '@/repositories/contract.repository';
// import { carRepository } from '@/repositories/car.repository';
// import { customerRepository } from '@/repositories/customer.repository';
import { ConflictError, NotFoundError } from '@/utils/custom-error';
import { meetingRepository } from '@/repositories/meeting.repository';
import { alarmRepository } from '@/repositories/alarm.repository';
import { CreateContractDto } from '@/types/contracts.schema';
import {
  UpdateContractRequestDto,
  ContractDetailResponseDto,
} from '@/dtos/contract.dto';
import { ContractWithRelations } from '@/types/contract.type';
import { userRepository } from '@/repositories/user.repository';
import prisma from '@/utils/prisma';

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
    const companyId = existingCar.company_id;
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
      const contractWithRelations = await contractRepository.findById(
        createdContract.id,
        {
          user: true,
          customer: true,
          car: true,
          meetings: { include: { alarms: true } },
        },
      );

      if (!contractWithRelations) {
        throw new Error('계약 생성 후 정보 조회 실패: 트랜잭션 롤백');
      }
      return contractWithRelations;
    });
    return {
      id: finalContract.id,
      status: finalContract.status,
      resolutionDate: finalContract.resolutionDate
        ? finalContract.resolutionDate.toISOString()
        : null,
      contractPrice: finalContract.contractPrice,

      user: { id: finalContract.userId, name: finalContract.userId.name },
      customer: {
        id: finalContract.customer.id,
        name: finalContract.customer.name,
      },
      car: { id: finalContract.car.id, model: finalContract.car.model },

      // meetings DTO 변환
      meetings: finalContract.meetings.map((m) => ({
        date: m.date.toISOString(),
        alarms: m.alarms.map((a) => a.alarmTime.toISOString()),
      })),
    } as ContractDetailResponseDto;
  }

  async updateContract(
    contractId: number,
    data: UpdateContractRequestDto,
  ): Promise<ContractDetailResponseDto> {
    const { meetings, userId, customerId, carId, ...baseContractData } = data;

    const existingContract = await contractRepository.findById(contractId);
    if (!existingContract) {
      throw new NotFoundError('존재하지 않는 계약입니다.');
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

      const finalContract = await contractRepository.findById(contractId, {
        user: true,
        customer: true,
        car: true,
        meetings: { include: { alarms: true } },
      });
      if (!finalContract) {
        throw new Error('업데이트 후 계약 정보를 찾을 수 없습니다.');
      }

      return finalContract;
    });

    const updatedContract = updatedContractDBResult as ContractWithRelations;

    return {
      id: updatedContract.id,
      status: updatedContract.status,
      resolutionDate: updatedContract.resolutionDate
        ? updatedContract.resolutionDate.toISOString()
        : null,
      contractPrice: updatedContract.contractPrice,

      user: { id: updatedContract.user.id, name: updatedContract.user.name },
      customer: {
        id: updatedContract.customer.id,
        name: updatedContract.customer.name,
      },
      car: { id: updatedContract.car.id, model: updatedContract.car.model },

      meetings: updatedContract.meetings.map((m) => ({
        date: m.date.toISOString(),
        alarms: m.alarms.map((a) => a.alarmTime.toISOString()),
      })),
    } as ContractDetailResponseDto;
  }
}

export const contractService = new ContractService();
