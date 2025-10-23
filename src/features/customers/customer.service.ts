// src/features/customers/customer.service.ts

import { Customer } from '@prisma/client';
import { CreateCustomerInput, UpdateCustomerInput } from './customer.dto';
import * as CustomerRepository from './customer.repository';

// 고객 생성 서비스 로직
export const createCustomerService = async (input: CreateCustomerInput, companyId: number): Promise<Customer> => {
  // DB에 전달할 데이터 준비
  const data = { ...input, companyId };
  
  // Repository 호출
  const newCustomer = await CustomerRepository.createCustomerRepository(data);
  return newCustomer;
};

// 고객 목록 조회 서비스 로직
export const getCustomersService = async (companyId: number): Promise<Customer[]> => {
  // 여기서 필터링, 정렬, 페이지네이션 등의 비즈니스 로직 처리 가능
  return CustomerRepository.findCustomersRepository(companyId);
};

// 특정 고객 조회 서비스 로직
export const getCustomerByIdService = async (customerId: number, companyId: number): Promise<Customer> => {
  const customer = await CustomerRepository.findCustomerByIdRepository(customerId, companyId);
  
  if (!customer) {

    throw new Error('Customer Not Found');
  }
  return customer;
};

// 고객 정보 수정 서비스 로직
export const updateCustomerService = async (customerId: number, companyId: number, input: UpdateCustomerInput): Promise<Customer> => {
  if (Object.keys(input).length === 0) {
    throw new Error('No Data to Update');
  }

  const updatedCustomer = await CustomerRepository.updateCustomerRepository(customerId, companyId, input);
  return updatedCustomer;
};

// 고객 삭제 서비스 로직
export const deleteCustomerService = async (customerId: number, companyId: number): Promise<void> => {

  await CustomerRepository.deleteCustomerRepository(customerId, companyId);
};