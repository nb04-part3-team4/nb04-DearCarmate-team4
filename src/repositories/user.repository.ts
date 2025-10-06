import prisma from '@/utils/prisma';
import { User } from '@prisma/client';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  employeeNumber: string;
  phoneNumber?: string;
  imageUrl?: string;
  companyId: number;
}

export interface UpdateUserInput {
  password?: string;
  name?: string;
  phoneNumber?: string;
  imageUrl?: string;
}

export class UserRepository {
  async create(data: CreateUserInput): Promise<User> {
    return await prisma.user.create({
      data,
    });
  }

  async findById(id: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findByEmployeeNumber(employeeNumber: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { employeeNumber },
    });
  }

  async update(id: number, data: UpdateUserInput): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<User> {
    return await prisma.user.delete({
      where: { id },
    });
  }

  async findByCompanyId(companyId: number) {
    return await prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        email: true,
        name: true,
        employeeNumber: true,
        phoneNumber: true,
        imageUrl: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const userRepository = new UserRepository();
