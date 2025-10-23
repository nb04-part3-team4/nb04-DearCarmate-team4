import { Meeting, Prisma } from '@prisma/client';
import { TxClient, MeetingDto } from '@/features/contracts/contract.type';

export class MeetingRepository {
  async create(
    tx: TxClient,
    data: { contractId: number } & Pick<MeetingDto, 'date'>,
  ): Promise<Meeting> {
    return await tx.meeting.create({
      data: {
        contract: { connect: { id: data.contractId } },
        date: new Date(data.date),
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
