import { authRepository } from '@/repositories/auth.repository';
import { verifyPassword } from '@/utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  JwtPayload,
} from '@/utils/jwt';
import { UnauthorizedError, NotFoundError } from '@/utils/custom-error';
import type {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
} from '@/dtos/auth.dto';

export class AuthService {
  async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    const { email, password } = data;

    // 1. 이메일로 유저 조회
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 2. 비밀번호 검증
    const isPasswordValid = await verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 3. JWT 페이로드 생성
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
    };

    // 4. 토큰 생성
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // 5. 응답 데이터 반환
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        employeeNumber: user.employeeNumber,
        isAdmin: user.isAdmin,
        companyId: user.companyId,
      },
    };
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<RefreshTokenResponseDto> {
    try {
      // 1. Refresh Token 검증
      const decoded = verifyRefreshToken(refreshToken);

      // 2. 유저 존재 여부 확인
      const user = await authRepository.findUserById(decoded.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // 3. 새로운 Access Token 생성
      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
      };

      const accessToken = generateAccessToken(payload);

      return { accessToken };
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Refresh token expired');
      } else if (error instanceof Error && error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
