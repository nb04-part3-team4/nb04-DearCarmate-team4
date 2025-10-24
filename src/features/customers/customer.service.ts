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
import {
  customerRepository,
  CustomerWithContractCount,
} from './customer.repository';
import { NotFoundError } from '@/shared/middlewares/custom-error';
import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from '@/features/customers/customer.schema';
import {
  CreateCustomerResponseDto,
  GetCustomersResponseDto,
  GetCustomerResponseDto,
  UpdateCustomerResponseDto,
  CustomerResponseDto,
  GetContractCustomersResponseDto,
} from '@/features/customers/customer.dto';

export class CustomerService {
  private toCustomerResponseDto(
    customer: CustomerWithContractCount,
  ): CustomerResponseDto {
    return {
      ...customer,
      contractCount: customer._count.contracts,
    };
  }

  async createCustomer(
    companyId: number,
    data: CreateCustomerInput,
  ): Promise<CreateCustomerResponseDto> {
    const customer = await customerRepository.create(companyId, data);
    return this.toCustomerResponseDto(customer);
  }

  async getCustomers(companyId: number): Promise<GetCustomersResponseDto> {
    const customers = await customerRepository.findManyByCompanyId(companyId);
    return customers.map(this.toCustomerResponseDto);
  }

  async getCustomerById(
    id: number,
    companyId: number,
  ): Promise<GetCustomerResponseDto> {
    const customer = await customerRepository.findById(id, companyId);
    if (!customer) {
      throw new NotFoundError('고객을 찾을 수 없습니다.');
    }
    return this.toCustomerResponseDto(customer);
  }

  async getCustomersForContract(
    companyId: number,
  ): Promise<GetContractCustomersResponseDto> {
    const customers = await customerRepository.findAllForContract(companyId);
    return customers.map((customer) => ({
      id: customer.id,
      data: customer.name,
    }));
  }

  async updateCustomer(
    id: number,
    companyId: number,
    data: UpdateCustomerInput,
  ): Promise<UpdateCustomerResponseDto> {
    const existingCustomer = await customerRepository.findById(id, companyId);
    if (!existingCustomer) {
      throw new NotFoundError('고객을 찾을 수 없습니다.');
    }
    const updatedCustomer = await customerRepository.update(id, data);
    return this.toCustomerResponseDto(updatedCustomer);
  }

  async deleteCustomer(id: number, companyId: number): Promise<void> {
    const existingCustomer = await customerRepository.findById(id, companyId);
    if (!existingCustomer) {
      throw new NotFoundError('고객을 찾을 수 없습니다.');
    }
    await customerRepository.delete(id);
  }
}

  await CustomerRepository.deleteCustomerRepository(customerId, companyId);
};