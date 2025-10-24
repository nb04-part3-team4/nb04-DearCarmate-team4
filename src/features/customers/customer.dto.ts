// src/features/customers/customer.dto.ts

import { z } from 'zod';

// 고객 생성을 위한 DTO (데이터 유효성 검증 포함)
export const CreateCustomerDto = z.object({
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다."),
  gender: z.enum(['male', 'female'], { 
    message: "성별은 'male' 또는 'female' 중 하나여야 합니다." 
  }),
  phoneNumber: z.string().regex(/^01[0-9]{8,9}$/, "유효한 휴대폰 번호 형식이 아닙니다."),
  ageGroup: z.enum([
    '10대', '20대', '30대', '40대', '50대', '60대', '70대', '80대'
  ], {
    message: "유효하지 않은 연령대입니다." 
  }),
  region: z.enum([
    '서울', '경기', '인천', '강원', '충북', '충남', '세종', '대전', '전북', '전남', 
    '광주', '경북', '경남', '대구', '울산', '부산', '제주'
  ], {
    message: "유효하지 않은 지역입니다." 
  }),
  email: z.string().email("유효한 이메일 형식이 아닙니다.").optional().or(z.literal('')),
  memo: z.string().max(500, "메모는 500자를 초과할 수 없습니다.").optional(),
});

export type CreateCustomerInput = z.infer<typeof CreateCustomerDto>;

// 고객 수정을 위한 DTO (모든 필드가 Optional)
export const UpdateCustomerDto = CreateCustomerDto.partial();

export type UpdateCustomerInput = z.infer<typeof UpdateCustomerDto>;
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
