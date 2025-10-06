import prisma from '@/utils/prisma';
import { Company } from '@prisma/client';

export interface CreateCompanyData {
  name: string;
  companyCode: string;
  address?: string;
  phone?: string;
}

export interface FindCompanyFilter {
  companyCode?: string;
  name?: string;
}

export class CompanyRepository {
  // create Company
  async create(data: CreateCompanyData): Promise<Company> {
    return await prisma.company.create({
      data,
    });
  }

  // search company by id
  async findById(id: number): Promise<Company | null> {
    return await prisma.company.findUnique({
      where: { id },
    });
  }

  // search company by companyCode
  async findByCompanyCode(companyCode: string): Promise<Company | null> {
    return await prisma.company.findUnique({
      where: { companyCode },
    });
  }

  // List out companies
  async findAll(filter?: FindCompanyFilter): Promise<Company[]> {
    return await prisma.company.findMany({
      where: {
        ...(filter?.companyCode && { companyCode: filter.companyCode }),
        ...(filter?.name && { name: { contains: filter.name } }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // List out users by companyId
  async findUsersByCompanyId(companyId: number) {
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

export const companyRepository = new CompanyRepository();
