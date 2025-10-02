// 로그인 요청 DTO
export interface LoginRequestDto {
  email: string;
  password: string;
}

// 토큰 재발급 요청 DTO
export interface RefreshTokenRequestDto {
  refreshToken: string;
}

// 로그인 응답 DTO
export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    employeeNumber: string;
    isAdmin: boolean;
    companyId: number;
  };
}

// 토큰 재발급 응답 DTO
export interface RefreshTokenResponseDto {
  accessToken: string;
}
