// @/features/customers/customer.type.ts (새 파일)

// Prisma Customer 모델의 타입을 가정합니다.
export interface Customer {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  companyCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------- 요청 DTO (Request) ----------------------

// 고객 생성 요청 본문 타입
export interface CreateCustomerRequestDto {
  name: string;
  email: string;
  phoneNumber: string;
  companyCode: string; // 계약에 사용될 회사 코드

  gender: string;
  ageGroup: string;
  region: string;
  company: string;
}

// 고객 수정 요청 본문 타입 (모든 필드는 선택 사항)
export interface UpdateCustomerRequestDto {
  name?: string;
  email?: string;
  phoneNumber?: string;
  companyCode?: string;
}

// ---------------------- 응답 DTO (Response) ----------------------

// 고객 단일 객체 응답
export type CustomerResponseDto = Omit<Customer, 'createdAt' | 'updatedAt'>;

// 고객 목록 응답
export type CustomerListResponseDto = CustomerResponseDto[];
