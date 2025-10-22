// src/features/customers/customer.repository.ts

import { PrismaClient, Customer } from '@prisma/client';
import { CreateCustomerInput, UpdateCustomerInput } from './customer.dto';

const prisma = new PrismaClient();

// 고객 생성
export const createCustomerRepository = async (data: CreateCustomerInput & { companyId: number }): Promise<Customer> => {
  return prisma.customer.create({
    data,
  });
};

// 고객 목록 조회 (검색/페이지네이션 기능은 여기에 추가)
export const findCustomersRepository = async (companyId: number): Promise<Customer[]> => {
  return prisma.customer.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
  });
};

// 특정 고객 조회
export const findCustomerByIdRepository = async (id: number, companyId: number): Promise<Customer | null> => {
  return prisma.customer.findUnique({
    where: { id, companyId },
  });
};

// 고객 정보 수정
export const updateCustomerRepository = async (id: number, companyId: number, data: UpdateCustomerInput): Promise<Customer> => {
  // Prisma는 해당 레코드가 없으면 에러를 던져주므로, 별도 존재 여부 검사는 생략
  return prisma.customer.update({
    where: { id, companyId },
    data,
  });
};

// 고객 삭제
export const deleteCustomerRepository = async (id: number, companyId: number): Promise<void> => {
  await prisma.customer.delete({
    where: { id, companyId },
  });
};