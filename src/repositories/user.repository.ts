import prisma from '@/utils/prisma';
import { User } from '@prisma/client';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  employeeNumber: string;
  phoneNumber?: string;
  imageUrl?: string;
  companyId: number;
}

export interface UpdateUserData {
  password?: string;
  name?: string;
  phoneNumber?: string;
  imageUrl?: string;
}

export class UserRepository {
  async create(data: CreateUserData): Promise<User> {
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

  async update(id: number, data: UpdateUserData): Promise<User> {
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
}

export const userRepository = new UserRepository();
