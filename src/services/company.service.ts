import { companyRepository } from '@/repositories/company.repository';
import { ConflictError, NotFoundError } from '@/utils/custom-error';
import type {
  CreateCompanyRequestDto,
  CreateCompanyResponseDto,
  GetCompaniesResponseDto,
  GetCompanyResponseDto,
  GetCompanyUsersResponseDto,
} from '@/dtos/company.dto';
import type { CompanyQueryParams } from '@/types/company.schema';
import { Company } from '@prisma/client';

// Single Responsibility: 회사 관련 비즈니스 로직만 담당
export class CompanyService {
  private toCompanyDto(
    company: Company,
    includeUpdatedAt: boolean = false,
  ): CreateCompanyResponseDto | GetCompanyResponseDto {
    const baseDto = {
      id: company.id,
      name: company.name,
      companyCode: company.companyCode,
      address: company.address || undefined,
      phone: company.phone || undefined,
      createdAt: company.createdAt,
    };

    if (includeUpdatedAt) {
      return {
        ...baseDto,
        updatedAt: company.updatedAt,
      };
    }

    return baseDto;
  }

  private async validateCompanyCodeUniqueness(companyCode: string) {
    const existingCompany =
      await companyRepository.findByCompanyCode(companyCode);
    if (existingCompany) {
      throw new ConflictError('Company code already exists');
    }
  }

  async registerCompany(
    data: CreateCompanyRequestDto,
  ): Promise<CreateCompanyResponseDto> {
    // 1. 회사 코드 중복 검증
    await this.validateCompanyCodeUniqueness(data.companyCode);

    // 2. 회사 생성
    const company = await companyRepository.create({
      name: data.name,
      companyCode: data.companyCode,
      address: data.address,
      phone: data.phone,
    });

    // 3. 응답 반환
    return this.toCompanyDto(company, false) as CreateCompanyResponseDto;
  }

  async getCompanies(
    query?: CompanyQueryParams,
  ): Promise<GetCompaniesResponseDto[]> {
    const companies = await companyRepository.findAll({
      companyCode: query?.companyCode,
      name: query?.name,
    });

    return companies.map((company) =>
      this.toCompanyDto(company, true),
    ) as GetCompaniesResponseDto[];
  }

  async getCompanyById(companyId: number): Promise<GetCompanyResponseDto> {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    return this.toCompanyDto(company, true) as GetCompanyResponseDto;
  }

  async getUsersByCompanyId(
    companyId: number,
  ): Promise<GetCompanyUsersResponseDto[]> {
    // 1. 회사 존재 확인
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    // 2. 해당 회사의 유저 목록 조회
    const users = await companyRepository.findUsersByCompanyId(companyId);

    // 3. DTO 변환 및 반환
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      employeeNumber: user.employeeNumber,
      phoneNumber: user.phoneNumber || undefined,
      imageUrl: user.imageUrl || undefined,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }
}

export const companyService = new CompanyService();
