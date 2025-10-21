// @/features/customers/customer.dto.js 파일 (추가)

// ... (기존 Customer DTO 정의들)

/**
 * GET /contracts/customers 응답에 사용되는 고객 목록 항목 DTO
 */
export interface ContractCustomerListItemDto {
  id: number;
  data: string; // "이름(이메일)" 형식
}

/**
 * GET /contracts/customers 최종 응답 DTO
 */
export type GetContractCustomersResponseDto = ContractCustomerListItemDto[];
