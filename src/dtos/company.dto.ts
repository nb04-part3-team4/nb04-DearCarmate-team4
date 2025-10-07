export interface CompanyDto {
  id: number;
  companyName: string;
  companyCode: string;
  userCount: number;
}

export type CreateCompanyResponseDto = CompanyDto;
export type UpdateCompanyResponseDto = CompanyDto;
export type CompanyItemDto = CompanyDto;

export interface GetCompaniesResponseDto {
  currentPage: number;
  totalPages: number;
  totalItemCount: number;
  data: CompanyItemDto[];
}

export interface CompanyUserItemDto {
  id: number;
  name: string;
  email: string;
  employeeNumber: string;
  phoneNumber?: string;
  company: {
    companyName: string;
  };
}

export interface GetCompanyUsersResponseDto {
  currentPage: number;
  totalPages: number;
  totalItemCount: number;
  data: CompanyUserItemDto[];
}
