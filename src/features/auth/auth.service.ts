import { userRepository } from '@/features/users/user.repository';
import { companyRepository } from '@/features/companies/company.repository';
import { verifyPassword } from '@/shared/middlewares/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  JwtPayload,
} from '@/shared/middlewares/jwt';
import {
  UnauthorizedError,
  NotFoundError,
} from '@/shared/middlewares/custom-error';
import type {
  LoginResponseDto,
  RefreshTokenResponseDto,
} from '@/features/auth/auth.dto';
import type { LoginRequestDto } from '@/features/auth/auth.schema';

export class AuthService {
  async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    const { email, password } = data;

    // 1. 이메일로 유저 조회
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('이메일 또는 비밀번호가 일치하지 않습니다');
    }

    // 2. 비밀번호 검증
    const isPasswordValid = await verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('이메일 또는 비밀번호가 일치하지 않습니다');
    }

    // 3. JWT 페이로드 생성
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
    };

    // 4. 회사 정보 조회
    const company = await companyRepository.findById(user.companyId);
    if (!company) {
      throw new NotFoundError('존재하지 않는 회사입니다');
    }

    // 5. 토큰 생성
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // 6. 응답 데이터 반환
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeNumber: user.employeeNumber,
        phoneNumber: user.phoneNumber || undefined,
        imageUrl: user.imageUrl || undefined,
        isAdmin: user.isAdmin,
        company: {
          companyCode: company.companyCode,
        },
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<RefreshTokenResponseDto> {
    try {
      // 1. Refresh Token 검증
      const decoded = verifyRefreshToken(refreshToken);

      // 2. 유저 존재 여부 확인
      const user = await userRepository.findById(decoded.userId);
      if (!user) {
        throw new NotFoundError('존재하지 않는 유저입니다');
      }

      // 3. 새로운 토큰 생성
      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
      };

      const accessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('리프레시 토큰이 만료되었습니다');
      } else if (error instanceof Error && error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('유효하지 않은 리프레시 토큰입니다');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
