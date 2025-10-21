import { Prisma } from '@prisma/client';

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
} as const satisfies Prisma.ContractInclude;

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
  resolutionDate?: string | null;
  contractPrice?: number;
  userId?: number;
  customerId?: number;
  carId?: number;
  contractName?: string;
}

export type TxClient = Prisma.TransactionClient;

export const CONTRACT_STATUSES = [
  'carInspection',
  'priceNegotiation',
  'contractDraft',
  'contractSuccessful',
  'contractFailed',
] as const;

export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export interface MeetingInput {
  date: string;
  alarms: string[];
}

export interface AlarmInput {
  meetingId: number;
  alarmTime: string;
}
