import prisma from '@/utils/prisma';
import { Customer } from '@prisma/client';

export class CustomerRepository {
  async findById(id: number): Promise<Customer | null> {
    return await prisma.customer.findUnique({
      where: { id },
    });
  }
}

export const customerRepository = new CustomerRepository();
