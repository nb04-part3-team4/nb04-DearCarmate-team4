import prisma from '@/shared/middlewares/prisma';
import { Company } from '@prisma/client';
import type { CompanyQueryParams } from '@/features/companies/company.schema';

export class CompanyRepository {
  async create(data: { name: string; companyCode: string }): Promise<Company> {
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

  async findByName(name: string): Promise<Company | null> {
    return await prisma.company.findFirst({
      where: { name },
    });
  }

  async findAll(
    params: CompanyQueryParams,
  ): Promise<{ data: Company[]; total: number }> {
    const { page, pageSize, searchBy, keyword } = params;
    const skip = (page - 1) * pageSize;

    const where =
      searchBy === 'companyName' && keyword
        ? { name: { contains: keyword } }
        : {};

    const [data, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.company.count({ where }),
    ]);

    return { data, total };
  }

  async update(
    id: number,
    data: { name?: string; companyCode?: string },
  ): Promise<Company> {
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

  async countUsersByCompanyId(companyId: number): Promise<number> {
    return await prisma.user.count({
      where: { companyId },
    });
  }
}

export const companyRepository = new CompanyRepository();
