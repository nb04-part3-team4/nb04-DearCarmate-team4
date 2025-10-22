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
    // 찾을 수 없으면 null 대신 커스텀 에러를 던질 수 있습니다.
    // 여기서는 간단히 null을 반환하여 Controller에서 404 처리하도록 합니다.
    throw new Error('Customer Not Found');
  }
  return customer;
};

// 고객 정보 수정 서비스 로직
export const updateCustomerService = async (customerId: number, companyId: number, input: UpdateCustomerInput): Promise<Customer> => {
  if (Object.keys(input).length === 0) {
    throw new Error('No Data to Update');
  }

  // 업데이트 전에 해당 고객이 존재하는지 확인하는 로직을 Repository에서 처리하지 않았다면 여기서 추가 가능
  const updatedCustomer = await CustomerRepository.updateCustomerRepository(customerId, companyId, input);
  return updatedCustomer;
};

// 고객 삭제 서비스 로직
export const deleteCustomerService = async (customerId: number, companyId: number): Promise<void> => {
  // 삭제 전에 이 고객이 활성 계약을 가지고 있는지 확인하는 로직 등을 여기서 추가합니다.
  await CustomerRepository.deleteCustomerRepository(customerId, companyId);
};