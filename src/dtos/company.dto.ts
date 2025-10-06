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

export interface GetCompaniesResponseDto {
  id: number;
  name: string;
  companyCode: string;
  address?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface GetCompanyUsersResponseDto {
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
