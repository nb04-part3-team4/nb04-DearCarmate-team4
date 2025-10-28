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
import {
  ContractStatus,
  ContractWithRelations,
  TxClient,
} from '@/features/contracts/contract.type';
import { ContractMapper } from '@/features/contracts/contract.mapper';
import { customerRepository } from '@/features/customers/customer.repository';
import {
  unlinkDocumentsByContractId,
  linkDocumentsToContract,
} from '@/features/contract-documents/contract-document.repository';
import { CarStatus } from '@prisma/client';
import { sendEmailWithAttachment } from '@/shared/middlewares/email';
import { findContractDocumentById } from '@/features/contract-documents/contract-document.repository';

export class ContractService {
  private static readonly ERROR_MESSAGES = {
    CAR_NOT_FOUND: '존재하지 않는 자동차입니다',
    CUSTOMER_NOT_FOUND: '존재하지 않는 고객입니다',
    CONTRACT_NOT_FOUND: '존재하지 않는 계약입니다',
    USER_NOT_FOUND: '존재하지 않는 담당자입니다',
    FORBIDDEN_UPDATE: '담당자만 수정이 가능합니다',
    FORBIDDEN_DELETE: '담당자만 삭제가 가능합니다',
    MISSING_COMPANY_ID: '회사 ID를 찾을 수 없습니다',
    TRANSACTION_FAILED: '트랜잭션 실패: 계약 정보를 찾을 수 없습니다',
    INVALID_DATE_FORMAT: '유효하지 않은 날짜 형식입니다',
  } as const;

  private static readonly NEXT_STATUS: Record<ContractStatus, ContractStatus> =
    {
      carInspection: 'priceNegotiation',
      priceNegotiation: 'contractDraft',
      contractDraft: 'contractSuccessful',
      contractSuccessful: 'contractSuccessful',
      contractFailed: 'contractFailed',
    } as const;

  private mapContractStatusToCarStatus(
    contractStatus: ContractStatus,
  ): CarStatus {
    switch (contractStatus) {
      case 'contractDraft':
      case 'carInspection':
      case 'priceNegotiation':
        return 'contractProceeding';
      case 'contractSuccessful':
        return 'contractCompleted';
      case 'contractFailed':
      default:
        return 'possession';
    }
  }

  private processResolutionDate(date: unknown): Date | null | undefined {
    if (date === undefined || date === null) {
      return date;
    }

    try {
      if (typeof date === 'string') {
        const trimmed = date.trim();
        if (trimmed === '') return null;
        return trimmed.length === 10
          ? new Date(`${trimmed}T00:00:00.000Z`)
          : new Date(trimmed);
      }

      if (typeof date === 'number') {
        return new Date(date);
      }

      if (date instanceof Date) return date;
      throw new Error(ContractService.ERROR_MESSAGES.INVALID_DATE_FORMAT);
    } catch {
      throw new Error(ContractService.ERROR_MESSAGES.INVALID_DATE_FORMAT);
    }
  }

  private _buildContractName(
    carModelId: string | number,
    customerName: string,
  ): string {
    return `${carModelId} - ${customerName} 고객님`;
  }

  private async _fetchAndBuildContractName(
    carId: number,
    customerId: number,
    companyId: number,
  ): Promise<string> {
    const [car, customer] = await Promise.all([
      CarRepository.findById({ carId }),
      customerRepository.findById(customerId, companyId),
    ]);

    if (!car || !customer) {
      throw new NotFoundError('차량 또는 고객 정보를 찾을 수 없습니다');
    }

    return this._buildContractName(car.model.model, customer.name);
  }

  async createContract(
    validatedData: CreateContractDto,
    userId: number,
  ): Promise<ContractDetailResponseDto> {
    const { carId, customerId, meetings } = validatedData;

    const car = await CarRepository.findById({ carId });
    if (!car) {
      throw new NotFoundError(ContractService.ERROR_MESSAGES.CAR_NOT_FOUND);
    }

    const customer = await customerRepository.findById(
      customerId,
      car.companyId,
    );
    if (!customer) {
      throw new NotFoundError(
        ContractService.ERROR_MESSAGES.CUSTOMER_NOT_FOUND,
      );
    }

    const contractName = this._buildContractName(
      car.model.model,
      customer.name,
    );

    const initialContractStatus: ContractStatus = 'carInspection';
    const initialCarStatus = this.mapContractStatusToCarStatus(
      initialContractStatus,
    );

    const finalContract = await prisma.$transaction(async (tx) => {
      const contract = await contractRepository.create(tx, {
        companyId: car.companyId,
        userId,
        carId,
        customerId,
        contractPrice: car.price,
        contractName: contractName,
      });

      // 💡 CarStatus 업데이트 (생성 시)
      await this.updateCarStatusInTransaction(tx, carId, initialCarStatus);

      if (meetings?.length) {
        await Promise.all(
          meetings.map(async (meeting) => {
            const createdMeeting = await meetingRepository.create(tx, {
              contractId: contract.id,
              date: meeting.date,
            });

            if (meeting.alarms?.length) {
              await Promise.all(
                meeting.alarms.map((alarmTime) =>
                  alarmRepository.create(tx, {
                    meetingId: createdMeeting.id,
                    alarmTime,
                  }),
                ),
              );
            }
          }),
        );
      }

      const contractWithRelations = await contractRepository.findById(
        tx,
        contract.id,
      );
      if (!contractWithRelations) {
        throw new Error(ContractService.ERROR_MESSAGES.TRANSACTION_FAILED);
      }

      return contractWithRelations;
    });

    return ContractMapper.toDetailDto(finalContract);
  }

  async updateContract(
    contractId: number,
    data: UpdateContractDto,
    requestUserId: number,
  ): Promise<ContractDetailResponseDto> {
    const {
      meetings,
      userId,
      customerId,
      carId,
      status,
      resolutionDate,
      contractDocuments,
      ...baseContractData
    } = data;

    const existingContract = await contractRepository.findById(
      prisma,
      contractId,
    );
    if (!existingContract) {
      throw new NotFoundError(
        ContractService.ERROR_MESSAGES.CONTRACT_NOT_FOUND,
      );
    }

    if (existingContract.userId !== requestUserId) {
      throw new ForbiddenError(ContractService.ERROR_MESSAGES.FORBIDDEN_UPDATE);
    }

    const processedResolutionDate = this.processResolutionDate(resolutionDate);
    const isOnlyStatusUpdate =
      status !== undefined &&
      Object.keys(baseContractData).length === 0 &&
      meetings === undefined &&
      userId === undefined &&
      customerId === undefined &&
      carId === undefined &&
      contractDocuments === undefined;

    if (isOnlyStatusUpdate) {
      return this.updateContractStatus(
        contractId,
        existingContract.carId,
        status as ContractStatus,
        processedResolutionDate,
      );
    }

    const updateData: Omit<UpdateContractDto, 'resolutionDate'> & {
      status?: ContractStatus;
      resolutionDate?: Date | null;
    } = {
      ...baseContractData,
      status: status as ContractStatus,
      userId,
      customerId,
      carId,
      meetings,
      contractDocuments,
      ...(processedResolutionDate !== undefined && {
        resolutionDate:
          processedResolutionDate instanceof Date
            ? processedResolutionDate
            : processedResolutionDate,
      }),
    };

    // Send email with attachments if contractDocuments are updated
    if (contractDocuments && contractDocuments.length > 0) {
      const realContractDocuments = await Promise.all(
        contractDocuments.map(async (doc) => {
          const document = await findContractDocumentById(doc.id);
          if (!document) {
            throw new NotFoundError(
              `계약 문서를 찾을 수 없습니다 (ID: ${doc.id})`,
            );
          }
          return document;
        }),
      );

      await sendEmailWithAttachment(
        existingContract.customer.email,
        '계약서 갱신',
        '계약서가 갱신되었습니다. 첨부된 문서를 확인해주세요.',
        realContractDocuments.map((doc) => ({
          filename: `Document_${doc.id}_${doc.fileName}`,
          path: doc.fileUrl,
        })),
      );
    }

    return this.updateFullContract(
      contractId,
      existingContract.carId,
      updateData as UpdateContractDto & {
        resolutionDate?: Date | null;
        status?: ContractStatus;
      },
      existingContract.companyId,
    );
  }

  private async updateCarStatusInTransaction(
    tx: TxClient,
    carId: number,
    carStatus: CarStatus,
  ): Promise<void> {
    // 💡 CarRepository의 updateInTx 메서드를 호출하도록 수정
    await CarRepository.updateInTx(tx, carId, {
      status: carStatus,
    });
  }

  private async updateContractStatus(
    contractId: number,
    carId: number,
    status: ContractStatus,
    resolutionDate: Date | null | undefined,
  ): Promise<ContractDetailResponseDto> {
    // 💡 newCarStatus 변수 정의 추가 (오류 4 해결)
    const newCarStatus = this.mapContractStatusToCarStatus(status);

    const updatedContract = await prisma.$transaction(async (tx) => {
      // 1. 계약 업데이트
      await contractRepository.update(tx, contractId, {
        status,
        ...(resolutionDate !== undefined && { resolutionDate }),
      });
      // 2. 차량 상태 업데이트
      await this.updateCarStatusInTransaction(tx, carId, newCarStatus);

      const contract = await contractRepository.findById(tx, contractId);
      if (!contract) {
        throw new Error(ContractService.ERROR_MESSAGES.TRANSACTION_FAILED);
      }
      return contract;
    });

    return ContractMapper.toDetailDto(updatedContract);
  }

  private async updateFullContract(
    contractId: number,
    originalCarId: number,
    data: UpdateContractDto & {
      resolutionDate?: Date | null;
      status?: ContractStatus;
    },
    companyId: number,
  ): Promise<ContractDetailResponseDto> {
    await this.validateUpdateData(data, companyId);

    const currentCarId = data.carId || originalCarId;

    const updatedContract = await prisma.$transaction(async (tx) => {
      // 1. 계약 업데이트
      await contractRepository.update(tx, contractId, {
        ...data,
        ...(data.carId &&
          data.customerId && {
            contractName: await this._fetchAndBuildContractName(
              data.carId,
              data.customerId,
              companyId,
            ),
          }),
      });

      // 2. 상태 필드가 포함되어 있으면 차량 상태 업데이트
      if (data.status) {
        const newCarStatus = this.mapContractStatusToCarStatus(data.status);
        await this.updateCarStatusInTransaction(tx, currentCarId, newCarStatus);
      }

      // 3. 미팅 업데이트 로직 (이전과 동일)
      if (data.meetings !== undefined) {
        await meetingRepository.deleteManyByContractId(tx, contractId);
        if (data.meetings.length) {
          await Promise.all(
            data.meetings.map(async (meeting) => {
              const createdMeeting = await meetingRepository.create(tx, {
                contractId,
                date: meeting.date,
              });

              const alarms = meeting.alarms as string[] | undefined;
              if (alarms?.length) {
                await Promise.all(
                  alarms.map((alarmTime: string) =>
                    alarmRepository.create(tx, {
                      meetingId: createdMeeting.id,
                      alarmTime,
                    }),
                  ),
                );
              }
            }),
          );
        }
      }

      // 4. 계약 문서 업데이트 로직
      if (data.contractDocuments !== undefined) {
        // 기존 문서 연결 해제 (contract-documents repository 사용)
        await unlinkDocumentsByContractId(tx, contractId);

        // 새 문서 연결 (contract-documents repository 사용)
        if (data.contractDocuments.length > 0) {
          await linkDocumentsToContract(tx, contractId, data.contractDocuments);
        }
      }

      const finalContract = await contractRepository.findById(tx, contractId);
      if (!finalContract) {
        throw new Error(ContractService.ERROR_MESSAGES.TRANSACTION_FAILED);
      }

      return finalContract;
    });

    return ContractMapper.toDetailDto(updatedContract);
  }

  private async validateUpdateData(
    data: Partial<UpdateContractDto>,
    companyId: number,
  ): Promise<void> {
    const validationPromises: Promise<void>[] = [];

    if (data.userId) {
      validationPromises.push(
        (async () => {
          const user = await userRepository.findById(data.userId!);
          if (!user) {
            throw new NotFoundError(
              ContractService.ERROR_MESSAGES.USER_NOT_FOUND,
            );
          }
        })(),
      );
    }

    if (data.carId) {
      validationPromises.push(
        (async () => {
          const car = await CarRepository.findById({ carId: data.carId! });
          if (!car) {
            throw new NotFoundError(
              ContractService.ERROR_MESSAGES.CAR_NOT_FOUND,
            );
          }
        })(),
      );
    }

    if (data.customerId) {
      validationPromises.push(
        (async () => {
          const customer = await customerRepository.findById(
            data.customerId!,
            companyId,
          );
          if (!customer) {
            throw new NotFoundError(
              ContractService.ERROR_MESSAGES.CUSTOMER_NOT_FOUND,
            );
          }
        })(),
      );
    }

    await Promise.all(validationPromises);
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

    const initialGroupedContracts: Record<
      ContractStatus,
      ContractWithRelations[]
    > = {
      carInspection: [],
      priceNegotiation: [],
      contractDraft: [],
      contractSuccessful: [],
      contractFailed: [],
    };

    const groupedContracts = contracts.reduce((acc, contract) => {
      const status = contract.status as ContractStatus;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(contract);
      return acc;
    }, initialGroupedContracts);

    return Object.entries(groupedContracts).reduce(
      (acc, [status, contractList]) => ({
        ...acc,
        [status]: {
          totalItemCount: contractList.length,
          data: contractList.map((contract) =>
            ContractMapper.toListItemDto(contract),
          ),
        },
      }),
      {} as GetContractsResponseDto,
    );
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
      throw new NotFoundError(
        ContractService.ERROR_MESSAGES.CONTRACT_NOT_FOUND,
      );
    }

    if (existingContract.userId !== requestUserId) {
      throw new ForbiddenError(ContractService.ERROR_MESSAGES.FORBIDDEN_DELETE);
    }

    const resetCarStatus: CarStatus = 'possession';

    // 💡 차량 상태 업데이트와 계약 삭제를 하나의 트랜잭션으로 묶어 원자성을 보장
    await prisma.$transaction(async (tx) => {
      // 1. 차량 상태 업데이트
      await this.updateCarStatusInTransaction(
        tx,
        existingContract.carId,
        resetCarStatus,
      );
      // 2. 계약 삭제
      await contractRepository.delete(tx, contractId);
    });

    return { message: '계약 삭제 성공' };
  }
}

export const contractService = new ContractService();
