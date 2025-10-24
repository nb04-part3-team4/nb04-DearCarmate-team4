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
    authProvider: string;
    company: {
      companyName: string;
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
