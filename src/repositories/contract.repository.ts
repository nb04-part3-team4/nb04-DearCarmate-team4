import prisma from '@/utils/prisma';
import type {
  CreateContractData,
  TxClient,
  UpdateContractBaseData,
  ContractWithRelations,
} from '@/types/contract.type';
import { Prisma } from '@prisma/client';

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
        car: {
          include: {
            model: true,
          },
        },
        meetings: {
          include: { alarms: true },
        },
      },
    });
  }

  async findById<T extends Prisma.ContractInclude>(
    id: number,
    include?: T,
  ): Promise<Prisma.ContractGetPayload<{ include: T }> | null> {
    return (await prisma.contract.findUnique({
      where: { id },
      include,
    })) as Prisma.ContractGetPayload<{ include: T }> | null;
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
