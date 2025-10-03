import prisma from '@/utils/prisma';
import { Company } from '@prisma/client';

export class CompanyRepository {
  async findByCompanyCode(companyCode: string): Promise<Company | null> {
    return await prisma.company.findUnique({
      where: { companyCode },
    });
  }

  async findById(id: number): Promise<Company | null> {
    return await prisma.company.findUnique({
      where: { id },
    });
  }
}

export const companyRepository = new CompanyRepository();
