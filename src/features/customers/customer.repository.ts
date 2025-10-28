import prisma from '@/shared/middlewares/prisma';
import { Customer } from '@prisma/client';
import { CreateCustomerInput, UpdateCustomerInput } from './customer.schema';
import { CAR_STATUS_VALUES } from '@/features/cars/cars.schema';

type CarStatus = (typeof CAR_STATUS_VALUES)[number];
const POSSESSION_STATUS = CAR_STATUS_VALUES[0];

export type CustomerWithContractCount = Customer & {
  _count: { contracts: number };
};

class CustomerRepository {
  async create(
    companyId: number,
    data: CreateCustomerInput,
  ): Promise<CustomerWithContractCount> {
    return await prisma.customer.create({
      data: {
        ...data,
        companyId,
      },
      include: {
        _count: {
          select: { contracts: true },
        },
      },
    });
  }

  async findManyByCompanyId(
    companyId: number,
  ): Promise<CustomerWithContractCount[]> {
    return await prisma.customer.findMany({
      where: { companyId },
      include: {
        _count: {
          select: { contracts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(
    id: number,
    companyId: number,
  ): Promise<CustomerWithContractCount | null> {
    return await prisma.customer.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: { contracts: true },
        },
      },
    });
  }

  async update(
    id: number,
    data: UpdateCustomerInput,
  ): Promise<CustomerWithContractCount> {
    return await prisma.customer.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { contracts: true },
        },
      },
    });
  }

  async findAllForContract(companyId: number) {
    return await prisma.customer.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
// 고객 생성
export const createCustomerRepository = async (
  data: CreateCustomerInput & { companyId: number },
): Promise<Customer> => {
  return prisma.customer.create({
    data,
  });
};

// 고객 목록 조회 (검색/페이지네이션 기능은 여기에 추가)
export const findCustomersRepository = async (
  companyId: number,
): Promise<Customer[]> => {
  return prisma.customer.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
  });
};

// 특정 고객 조회
export const findCustomerByIdRepository = async (
  id: number,
  companyId: number,
): Promise<Customer | null> => {
  return prisma.customer.findUnique({
    where: { id, companyId },
  });
};

// 고객 정보 수정
export const updateCustomerRepository = async (
  id: number,
  companyId: number,
  data: UpdateCustomerInput,
): Promise<Customer> => {
  // Prisma는 해당 레코드가 없으면 에러를 던져주므로, 별도 존재 여부 검사는 생략
  return prisma.customer.update({
    where: { id, companyId },
    data,
  });
};

// 고객 삭제
export const deleteCustomerRepository = async (
  id: number,
  companyId: number,
): Promise<Customer> => {
  const deletedCustomer = await prisma.$transaction(async (tx) => {
    const carsToReset = await tx.contract.findMany({
      where: { customerId: id },
      select: { carId: true },
    });

    const carIds = carsToReset.map((c) => c.carId);
    if (carIds.length > 0) {
      await tx.car.updateMany({
        where: {
          id: { in: carIds },
        },
        data: {
          status: POSSESSION_STATUS as CarStatus,
        },
      });
    }
    const customer = await tx.customer.delete({
      where: { id, companyId },
    });

    return customer;
  });

  return deletedCustomer;
};
export const customerRepository = new CustomerRepository();
