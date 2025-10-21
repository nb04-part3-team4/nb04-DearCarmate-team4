import prisma from '@/shared/middlewares/prisma';

export class CustomerRepository {
  // ... (기존 메서드들: create, findById, findByEmail 등)

  /**
   * 계약 화면에서 필요한 고객 목록 (ID, 이름, 이메일)을 조회합니다.
   */
  async findAllCustomersForContract() {
    return await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        email: true, // 고객 선택 드롭다운에 표시할 정보
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
  async findById(customerId: number) {
    // 🚨 오류 해결: prisma 클라이언트를 사용하여 쿼리 실행
    return await prisma.customer.findUnique({
      where: {
        id: customerId, // 인수로 받은 id를 사용 (축약형 { id }도 가능)
      },
    });
  }
}

export const customerRepository = new CustomerRepository();
