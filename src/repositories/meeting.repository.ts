import { Meeting, Prisma } from '@prisma/client';
import prisma from '@/utils/prisma';
import { TxClient } from '@/types/contract.type'; 

export class MeetingRepository {
  async create(
    tx: TxClient,
    data: { contractId: number; date: string },
  ): Promise<Meeting> {
    return await tx.meeting.create({
      data: {
        contract: { connect: { id: data.contractId } },
        date: data.date,
      },
    });
  }
  async deleteManyByContractId(
    tx: TxClient,
    contractId: number,
  ): Promise<Prisma.BatchPayload> {
    return await tx.meeting.deleteMany({
      where: { contractId: contractId },
    });
  }
}

export const meetingRepository = new MeetingRepository();