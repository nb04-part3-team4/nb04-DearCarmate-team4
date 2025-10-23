import prisma from '@/shared/middlewares/prisma';
import { Customer } from '@prisma/client';
import { CreateCustomerInput, UpdateCustomerInput } from './customer.schema';

export type CustomerWithContractCount = Customer & {
  _count: { contracts: number };
};

export class CustomerRepository {
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

  async delete(id: number): Promise<Customer> {
    return await prisma.customer.delete({
      where: { id },
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

export const customerRepository = new CustomerRepository();
