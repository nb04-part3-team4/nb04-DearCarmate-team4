import { companyRepository } from '@/repositories/company.repository';
import { userRepository } from '@/repositories/user.repository';
import { ConflictError, NotFoundError } from '@/middlewares/custom-error';
import type {
  CreateCompanyResponseDto,
  GetCompaniesResponseDto,
  GetCompanyUsersResponseDto,
  UpdateCompanyResponseDto,
} from '@/dtos/company.dto';
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyQueryParams,
  CompanyUsersQueryParams,
} from '@/types/company.schema';

export class CompanyService {
  private async getUserCount(companyId: number): Promise<number> {
    return await companyRepository.countUsersByCompanyId(companyId);
  }

  async registerCompany(
    data: CreateCompanyInput,
  ): Promise<CreateCompanyResponseDto> {
    const existingCompany = await companyRepository.findByCompanyCode(
      data.companyCode,
    );
    if (existingCompany) {
      throw new ConflictError('이미 존재하는 회사 코드입니다');
    }

    const company = await companyRepository.create({
      name: data.companyName,
      companyCode: data.companyCode,
    });

    const userCount = await this.getUserCount(company.id);

    return {
      id: company.id,
      companyName: company.name,
      companyCode: company.companyCode,
      userCount,
    };
  }

  async getCompanies(
    params: CompanyQueryParams,
  ): Promise<GetCompaniesResponseDto> {
    const { data, total } = await companyRepository.findAll(params);
    const totalPages = Math.ceil(total / params.pageSize);

    const companiesWithUserCount = await Promise.all(
      data.map(async (company) => ({
        id: company.id,
        companyName: company.name,
        companyCode: company.companyCode,
        userCount: await this.getUserCount(company.id),
      })),
    );

    return {
      currentPage: params.page,
      totalPages,
      totalItemCount: total,
      data: companiesWithUserCount,
    };
  }

  async updateCompany(
    companyId: number,
    data: UpdateCompanyInput,
  ): Promise<UpdateCompanyResponseDto> {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError('존재하지 않는 회사입니다');
    }

    const updateData: { name?: string; companyCode?: string } = {};
    if (data.companyName !== undefined) {
      updateData.name = data.companyName;
    }
    if (data.companyCode !== undefined) {
      updateData.companyCode = data.companyCode;
    }

    const updatedCompany = await companyRepository.update(
      companyId,
      updateData,
    );
    const userCount = await this.getUserCount(updatedCompany.id);

    return {
      id: updatedCompany.id,
      companyName: updatedCompany.name,
      companyCode: updatedCompany.companyCode,
      userCount,
    };
  }

  async deleteCompany(companyId: number): Promise<void> {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError('존재하지 않는 회사입니다');
    }

    await companyRepository.delete(companyId);
  }

  async getUsersByCompanyId(
    params: CompanyUsersQueryParams,
  ): Promise<GetCompanyUsersResponseDto> {
    const { data, total } = await userRepository.findByCompanyId(params);
    const totalPages = Math.ceil(total / params.pageSize);

    const usersWithCompany = await Promise.all(
      data.map(async (user) => {
        const company = await companyRepository.findById(user.companyId);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          employeeNumber: user.employeeNumber,
          phoneNumber: user.phoneNumber || undefined,
          company: {
            companyName: company?.name || '',
          },
        };
      }),
    );

    return {
      currentPage: params.page,
      totalPages,
      totalItemCount: total,
      data: usersWithCompany,
    };
  }
}

export const companyService = new CompanyService();
