// @/features/customers/customer.service.js 파일 수정 (예시)

import { customerRepository } from '@/features/customers/customer.repository.js';
// 🔽 새로 정의한 DTO를 가져옵니다.
import type { GetContractCustomersResponseDto } from '@/features/customers/customer.dto.js';

export class CustomerService {
  // ... (기존 메서드들)

  /**
   * 계약 등록/수정 시 사용할 고객 목록을 조회하고 DTO로 변환합니다.
   */
  async getCustomersForContract(): Promise<GetContractCustomersResponseDto> {
    const customers = await customerRepository.findAllCustomersForContract();

    // API 응답 형태({ id, data: "이름(이메일)" })로 변환
    return customers.map((customer) => ({
      id: customer.id,
      data: `${customer.name}(${customer.email})`,
    }));
  }
}

export const customerService = new CustomerService();
