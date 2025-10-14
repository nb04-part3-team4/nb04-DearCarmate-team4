import { Alarm, Prisma } from '@prisma/client';
import { TxClient } from '@/types/contract.type'; 

export class AlarmRepository {
  async create(
    tx: TxClient,
    data: { meetingId: number; alarmTime: string }
  ): Promise<Alarm> {
    return await tx.alarm.create({
      data: {
        meeting: { connect: { id: data.meetingId } },
        alarmTime: data.alarmTime,
      },
    });
  }
}

export const alarmRepository = new AlarmRepository();