import { Prisma } from '@prisma/client';

export const CONTRACT_STATUSES = [
  'carInspection',
  'priceNegotiation',
  'contractDraft',
  'contractSuccessful',
  'contractFailed',
] as const;

export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export const contractFullInclude = {
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
} as const;

export type ContractWithRelations = Prisma.ContractGetPayload<{
  include: typeof contractFullInclude;
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
  resolutionDate?: Date | null;
  contractPrice?: number;
  userId?: number;
  customerId?: number;
  carId?: number;
  contractName?: string;
}

export interface MeetingInput {
  date: string;
  alarms: string[];
}

export interface AlarmInput {
  meetingId: number;
  alarmTime: string;
}

export type TxClient = Prisma.TransactionClient;