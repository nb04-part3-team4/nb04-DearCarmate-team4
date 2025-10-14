import prisma from '@/utils/prisma';
import type {
  CreateContractData,
  TxClient,
  UpdateContractBaseData,
  ContractWithRelations,
} from '@/types/contract.type';
import { Contract, Prisma } from '@prisma/client';

export class ContractRepository {
  async create(
    tx: TxClient,
    data: CreateContractData,
  ): Promise<ContractWithRelations> {
    return await tx.contract.create({
      data,
      include: {
        user: true,
        customer: true,
        car: true,
        meetings: {
          include: { alarms: true },
        },
      },
    });
  }

  async findById(
    id: number,
    include?: Prisma.ContractInclude,
  ): Promise<Contract | null> {
    return await prisma.contract.findUnique({
      where: { id },
      include,
    });
  }

  async update(
    tx: TxClient,
    id: number,
    data: UpdateContractBaseData,
  ): Promise<void> {
    const updateData: Prisma.ContractUpdateInput = {
      status: data.status,
      resolutionDate: data.resolutionDate,
      contractPrice: data.contractPrice,
      ...(data.userId && { user: { connect: { id: data.userId } } }),
      ...(data.customerId && {
        customer: { connect: { id: data.customerId } },
      }),
      ...(data.carId && { car: { connect: { id: data.carId } } }),
    };
    await tx.contract.update({
      where: { id },
      data: updateData,
    });
  }
}

export const contractRepository = new ContractRepository();
