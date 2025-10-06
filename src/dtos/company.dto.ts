export interface CreateCompanyResponseDto {
  id: number;
  companyName: string;
  companyCode: string;
  userCount: number;
}

export interface UpdateCompanyResponseDto {
  id: number;
  companyName: string;
  companyCode: string;
  userCount: number;
}

export interface CompanyItemDto {
  id: number;
  companyName: string;
  companyCode: string;
  userCount: number;
}

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
