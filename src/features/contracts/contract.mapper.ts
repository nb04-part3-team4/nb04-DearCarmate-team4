import type { ContractWithRelations } from '@/features/contracts/contract.type';
import type {
  ContractDetailResponseDto,
  ContractListItemDto,
  MeetingResponseDto,
} from '@/features/contracts/contract.dto';

export class ContractMapper {
  private static toMeetingDto(
    meeting: ContractWithRelations['meetings'][number],
  ): MeetingResponseDto {
    return {
      date: meeting.date.toISOString(),
      alarms: meeting.alarms.map((a) => a.alarmTime.toISOString()),
    };
  }

  /**
   * Contract 상세 응답 DTO로 변환
   */
  static toDetailDto(
    contract: ContractWithRelations,
  ): ContractDetailResponseDto {
    return {
      id: contract.id,
      status: contract.status,
      resolutionDate: contract.resolutionDate
        ? contract.resolutionDate.toISOString()
        : null,
      contractPrice: contract.contractPrice,
      user: {
        id: contract.user.id,
        name: contract.user.name,
      },
      customer: {
        id: contract.customer.id,
        name: contract.customer.name,
      },
      car: {
        id: contract.car.id,
        model: contract.car.model.model,
      },
      meetings: contract.meetings.map((m) => this.toMeetingDto(m)),
    };
  }

  static toListItemDto(contract: ContractWithRelations): ContractListItemDto {
    return {
      id: contract.id,
      car: {
        id: contract.car.id,
        model: contract.car.model.model,
      },
      customer: {
        id: contract.customer.id,
        name: contract.customer.name,
      },
      user: {
        id: contract.user.id,
        name: contract.user.name,
      },
      meetings: contract.meetings.map((m) => this.toMeetingDto(m)),
      contractPrice: contract.contractPrice,
      resolutionDate: contract.resolutionDate
        ? contract.resolutionDate.toISOString()
        : null,
      status: contract.status,
    };
  }
}
