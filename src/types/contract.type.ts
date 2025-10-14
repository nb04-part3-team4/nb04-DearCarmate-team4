import { Prisma } from '@prisma/client';

export type ContractWithRelations = Prisma.ContractGetPayload<{
  include: {
    user: true;
    customer: true;
    car: {
      include: {
        model: true;
      };
    };
    meetings: {
      include: { alarms: true };
    };
  };
}>;

export interface CreateContractData {
  contractName: string;
  companyId: number;
  userId: number;
  carId: number;
  customerId: number;
  contractPrice: number;
}

export interface UpdateContractBaseData {
  status?: string;
  resolutionDate?: string | null;
  contractPrice?: number;
  userId?: number;
  customerId?: number;
  carId?: number;
}

export type TxClient = Prisma.TransactionClient;
