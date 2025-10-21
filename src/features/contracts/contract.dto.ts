export interface BaseUserDto {
  id: number;
  name: string;
}

export interface BaseCustomerDto {
  id: number;
  name: string;
}

export interface BaseCarDto {
  id: number;
  model: string;
}

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

export interface ContractListItemDto {
  id: number;
  car: BaseCarDto;
  customer: BaseCustomerDto;
  user: BaseUserDto;
  meetings: MeetingResponseDto[];
  contractPrice: number;
  resolutionDate: string | null;
  status: string;
}

export interface ContractListGroupDto {
  totalItemCount: number;
  data: ContractListItemDto[];
}

export interface GetContractsResponseDto {
  carInspection: ContractListGroupDto;
  priceNegotiation: ContractListGroupDto;
  contractDraft: ContractListGroupDto;
  contractSuccessful: ContractListGroupDto;
  contractFailed: ContractListGroupDto;
}

export interface DeleteContractResponseDto {
  message: string;
}
