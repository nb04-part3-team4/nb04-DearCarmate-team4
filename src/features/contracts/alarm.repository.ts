import { Alarm } from '@prisma/client';
import { TxClient } from '@/features/contracts/contract.type';
import type { AlarmInput } from '@/features/contracts/contract.type';

export class AlarmRepository {
  async create(
    tx: TxClient,
    data: Pick<AlarmInput, 'meetingId' | 'alarmTime'>,
  ): Promise<Alarm> {
    const date = new Date(data.alarmTime);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid alarm time format');
    }
    return await tx.alarm.create({
      data: {
        meeting: { connect: { id: data.meetingId } },
        alarmTime: date,
      },
    });
  }
}

export const alarmRepository = new AlarmRepository();
