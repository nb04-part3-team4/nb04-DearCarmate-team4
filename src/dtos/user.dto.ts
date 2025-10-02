// 회원가입 요청 DTO
export interface SignupRequestDto {
  email: string;
  password: string;
  name: string;
  employeeNumber: string;
  phoneNumber?: string;
  companyCode: string;
  imageUrl?: string;
}

// 회원가입 응답 DTO
export interface SignupResponseDto {
  id: number;
  email: string;
  name: string;
  employeeNumber: string;
  phoneNumber?: string;
  imageUrl?: string;
  isAdmin: boolean;
  companyId: number;
  createdAt: Date;
}

// 내 정보 조회 응답 DTO
export interface GetMeResponseDto {
  id: number;
  email: string;
  name: string;
  employeeNumber: string;
  phoneNumber?: string;
  imageUrl?: string;
  isAdmin: boolean;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}

// 내 정보 수정 요청 DTO
export interface UpdateMeRequestDto {
  password: string; // 현재 비밀번호 (본인 확인용)
  newPassword?: string; // 새 비밀번호 (변경 시)
  name?: string;
  phoneNumber?: string;
  imageUrl?: string;
}

// 내 정보 수정 응답 DTO
export interface UpdateMeResponseDto {
  id: number;
  email: string;
  name: string;
  employeeNumber: string;
  phoneNumber?: string;
  imageUrl?: string;
  isAdmin: boolean;
  companyId: number;
  updatedAt: Date;
}

// 유저 조회 응답 DTO (관리자용)
export interface GetUserResponseDto {
  id: number;
  email: string;
  name: string;
  employeeNumber: string;
  phoneNumber?: string;
  imageUrl?: string;
  isAdmin: boolean;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}
