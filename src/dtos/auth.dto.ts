import { BaseUserDto } from '@/types/user.types';

// 로그인 요청 DTO
export interface LoginRequestDto {
  email: string;
  password: string;
}

// 토큰 재발급 요청 DTO
export interface RefreshTokenRequestDto {
  refreshToken: string;
}

// 로그인 응답 유저 정보 (BaseUserDto에서 필요한 필드만 선택)
export type LoginUserDto = Pick<
  BaseUserDto,
  'id' | 'email' | 'name' | 'employeeNumber' | 'isAdmin' | 'companyId'
>;

// 로그인 응답 DTO
export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: LoginUserDto;
}

// 토큰 재발급 응답 DTO
export interface RefreshTokenResponseDto {
  accessToken: string;
}
