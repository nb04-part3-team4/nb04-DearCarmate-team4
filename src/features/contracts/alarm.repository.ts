import { Alarm } from '@prisma/client';
import { TxClient } from '@/features/contracts/contract.type';
import type { AlarmInput } from '@/features/contracts/contract.type';

export class AlarmRepository {
  async create(
    tx: TxClient,
    data: Pick<AlarmInput, 'meetingId' | 'alarmTime'>,
  ): Promise<Alarm> {
    return await tx.alarm.create({
      data: {
        meeting: { connect: { id: data.meetingId } },
        alarmTime: new Date(data.alarmTime),
      },
    });
  }
}

export const alarmRepository = new AlarmRepository();
