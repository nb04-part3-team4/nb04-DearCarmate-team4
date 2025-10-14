import { UserResponseDto } from '@/dtos/user.dto';
// import { CustomerResponseDto } from '@/dtos/customer.dto';
// import { CarResponseDto } from '@/dtos/car.dto'; 
import { CreateContractDto, UpdateContractDto } from '@/types/contracts.schema';


export type CreateContractRequestDto = CreateContractDto;
export type UpdateContractRequestDto = UpdateContractDto;

export type BaseUserDto = Pick<UserResponseDto, 'id' | 'name'>;
// export type BaseCustomerDto = Pick<CustomerResponseDto, 'id' | 'name'>;
// export type BaseCarDto = Pick<CarResponseDto, 'id' | 'model'>;

export interface MeetingResponseDto {
  date: string;
  alarms: string[];
}

export interface ContractDetailResponseDto {
  id: number;
  status: string;
  resolutionDate: string | null;
  contractPrice: number;
  user: BaseUserDto;
  customer: BaseCustomerDto;
  car: BaseCarDto;
  meetings: MeetingResponseDto[];
}

// ----------------------------------------------------
// 4. GET (목록 조회) 응답 DTO
// ----------------------------------------------------

// 4-1. 목록의 개별 항목 DTO (ContractDetailResponseDto에서 불필요한 필드를 제거하거나 최적화)
// export interface ContractListItemDto {
//   id: number;
//   car: BaseCarDto;
//   customer: BaseCustomerDto;
//   user: BaseUserDto;
//   meetings: MeetingResponseDto[];
//   contractPrice: number;
//   resolutionDate: string | null;
//   status: string;
// }

// // 4-2. 상태별 그룹 DTO
// export interface ContractListGroupDto {
//   totalItemCount: number;
//   data: ContractListItemDto[];
// }

// // 4-3. 최종 GET 응답 DTO (상태(status)를 키로 사용)
// export interface GetContractsResponseDto {
//   [status: string]: ContractListGroupDto;
// }

export interface DeleteContractResponseDto {
  message: string;
}
