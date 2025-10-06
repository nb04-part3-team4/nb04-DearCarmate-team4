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
  user: {
    id: number;
    name: string;
    email: string;
    employeeNumber: string;
    phoneNumber?: string;
    imageUrl?: string;
    isAdmin: boolean;
    company: {
      companyCode: string;
    };
  };
  accessToken: string;
  refreshToken: string;
}

// 토큰 재발급 응답 DTO
export interface RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
}
