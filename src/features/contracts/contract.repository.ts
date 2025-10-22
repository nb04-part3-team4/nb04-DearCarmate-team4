import prisma from '@/shared/middlewares/prisma';
import type {
  CreateContractData,
  TxClient,
  UpdateContractBaseData,
  ContractWithRelations,
} from '@/features/contracts/contract.type';
import { Prisma, PrismaClient } from '@prisma/client';
import { contractFullInclude as fullInclude } from '@/features/contracts/contract.type';

type searchByContract = 'customerName' | 'userName';

export class ContractRepository {
  async create(
    tx: TxClient,
    data: CreateContractData,
  ): Promise<ContractWithRelations> {
    return await tx.contract.create({
      data,
      include: fullInclude,
    });
  }

  // 트랜잭션 일관성: client를 인자로 받아 tx 내부에서도 같은 트랜잭션 사용
  async findById(
    client: TxClient | typeof prisma,
    id: number,
  ): Promise<ContractWithRelations | null> {
    return await client.contract.findUnique({
      where: { id },
      include: fullInclude,
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
      ...(data.customerId && {customer: { connect: { id: data.customerId } }}),
      ...(data.carId && { car: { connect: { id: data.carId } } }),
      ...(data.contractName && { contractName: data.contractName }),
    };
    await tx.contract.update({
      where: { id },
      data: updateData,
    });
  }

  async findAllByCompanyId(
    companyId: number,
    searchBy?: searchByContract,
    keyword?: string,
  ): Promise<ContractWithRelations[]> {
    const where: Prisma.ContractWhereInput = { companyId };
    if (searchBy && keyword && keyword.trim() !== '') {
      const searchKeyword = keyword.trim();

      if (searchBy === 'customerName') {
        where.customer = {
          name: {
            contains: searchKeyword,
            mode: 'insensitive',
          },
        };
      } else if (searchBy === 'userName') {
        where.user = {
          name: {
            contains: searchKeyword,
            mode: 'insensitive',
          },
        };
      }
    }
    return (await prisma.contract.findMany({
      where,
      include: fullInclude,
      orderBy: {
        createdAt: 'desc',
      },
    })) as unknown as Promise<ContractWithRelations[]>;
  }
  async delete(
    prisma: PrismaClient | Prisma.TransactionClient,
    contractId: number,
  ) {
    return prisma.contract.delete({
      where: {
        id: contractId,
      },
    });
  }
}

export const contractRepository = new ContractRepository();