export interface CreateCompanyRequestDto {
  name: string;
  companyCode: string;
  address?: string;
  phone?: string;
}

export interface CreateCompanyResponseDto {
  id: number;
  name: string;
  companyCode: string;
  address?: string;
  phone?: string;
  createdAt: Date;
}

export interface CompanyItemDto {
  id: number;
  name: string;
  companyCode: string;
  address?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetCompaniesResponseDto {
  data: CompanyItemDto[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface GetCompanyResponseDto {
  id: number;
  name: string;
  companyCode: string;
  address?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateCompanyRequestDto {
  name?: string;
  address?: string;
  phone?: string;
}

export interface UpdateCompanyResponseDto {
  id: number;
  name: string;
  companyCode: string;
  address?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyUserItemDto {
  id: number;
  email: string;
  name: string;
  employeeNumber: string;
  phoneNumber?: string;
  imageUrl?: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetCompanyUsersResponseDto {
  data: CompanyUserItemDto[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}
