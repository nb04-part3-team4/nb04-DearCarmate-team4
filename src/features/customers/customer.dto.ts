import { Customer } from '@prisma/client';

export interface CustomerResponseDto {
  id: number;
  name: string;
  gender: string;
  phoneNumber: string;
  ageGroup: string;
  region: string;
  email: string | null;
  memo: string | null;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  contractCount: number;
}

export interface ContractCustomerListItemDto {
  id: number;
  data: string;
}

export type CreateCustomerResponseDto = CustomerResponseDto;
export type GetCustomerResponseDto = CustomerResponseDto;
export type UpdateCustomerResponseDto = CustomerResponseDto;
export type GetCustomersResponseDto = CustomerResponseDto[];

export type GetContractCustomersResponseDto = ContractCustomerListItemDto[];
