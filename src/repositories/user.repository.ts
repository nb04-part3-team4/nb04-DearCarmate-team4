import prisma from '@/utils/prisma';
import { User } from '@prisma/client';
import type { CompanyUsersQueryParams } from '@/types/company.schema';

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

  async findByCompanyId(params: CompanyUsersQueryParams) {
    const { page, pageSize, searchBy, keyword } = params;
    const skip = (page - 1) * pageSize;

    let where: {
      company?: { name: { contains: string } };
      name?: { contains: string };
      email?: { contains: string };
    } = {};

    if (searchBy && keyword) {
      if (searchBy === 'companyName') {
        where = {
          company: {
            name: { contains: keyword },
          },
        };
      } else if (searchBy === 'name') {
        where = { name: { contains: keyword } };
      } else if (searchBy === 'email') {
        where = { email: { contains: keyword } };
      }
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
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
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  }
}

export const userRepository = new UserRepository();
