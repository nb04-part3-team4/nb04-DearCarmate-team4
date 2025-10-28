import {
  customerRepository,
  CustomerWithContractCount,
  deleteCustomerRepository,
} from '@/features/customers/customer.repository';
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

class CustomerService {
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
    await deleteCustomerRepository(id, companyId);
  }
}

export const customerService = new CustomerService();
