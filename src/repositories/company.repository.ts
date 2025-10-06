import prisma from '@/utils/prisma';
import { Company } from '@prisma/client';
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyQueryParams,
} from '@/types/company.schema';

export class CompanyRepository {
  async create(data: CreateCompanyInput): Promise<Company> {
    return await prisma.company.create({
      data,
    });
  }

  async findById(id: number): Promise<Company | null> {
    return await prisma.company.findUnique({
      where: { id },
    });
  }

  async findByCompanyCode(companyCode: string): Promise<Company | null> {
    return await prisma.company.findUnique({
      where: { companyCode },
    });
  }

  async findAll(filter?: CompanyQueryParams): Promise<Company[]> {
    return await prisma.company.findMany({
      where: {
        ...(filter?.companyCode && { companyCode: filter.companyCode }),
        ...(filter?.name && { name: { contains: filter.name } }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, data: UpdateCompanyInput): Promise<Company> {
    return await prisma.company.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Company> {
    return await prisma.company.delete({
      where: { id },
    });
  }
}

export const companyRepository = new CompanyRepository();
