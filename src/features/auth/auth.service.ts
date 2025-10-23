import { userRepository } from '@/features/users/user.repository';
import { companyRepository } from '@/features/companies/company.repository';
import { verifyPassword, hashPassword } from '@/shared/middlewares/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  JwtPayload,
} from '@/shared/middlewares/jwt';
import {
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '@/shared/middlewares/custom-error';
import type {
  LoginResponseDto,
  RefreshTokenResponseDto,
} from '@/features/auth/auth.dto';
import type {
  LoginRequestDto,
  GoogleLoginRequestDto,
  GoogleSignupRequestDto,
  GoogleReauthRequestDto,
} from '@/features/auth/auth.schema';
import { OAuth2Client } from 'google-auth-library';

export class AuthService {
  private googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

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

    // 3. 회사 정보 조회
    const company = await companyRepository.findById(user.companyId);
    if (!company) {
      throw new NotFoundError('존재하지 않는 회사입니다');
    }

    // 4. JWT 페이로드 생성
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
    };

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
        authProvider: user.authProvider,
        company: {
          companyName: company.name,
        },
      },
      accessToken,
      refreshToken,
    };
  }

  async googleLogin(data: GoogleLoginRequestDto): Promise<LoginResponseDto> {
    try {
      // 1. Google 토큰 검증
      const ticket = await this.googleClient.verifyIdToken({
        idToken: data.token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedError('유효하지 않은 Google 토큰입니다');
      }

      const googleEmail = payload.email;

      // 2. 이메일로 유저 조회
      const user = await userRepository.findByEmail(googleEmail);
      if (!user) {
        throw new UnauthorizedError(
          '등록되지 않은 사용자입니다. 관리자에게 문의하세요.',
        );
      }

      // 3. 회사 정보 조회
      const company = await companyRepository.findById(user.companyId);
      if (!company) {
        throw new NotFoundError('존재하지 않는 회사입니다');
      }

      // 4. JWT 페이로드 생성
      const jwtPayload: JwtPayload = {
        userId: user.id,
        email: user.email,
        companyId: user.companyId,
      };

      // 5. 토큰 생성
      const accessToken = generateAccessToken(jwtPayload);
      const refreshToken = generateRefreshToken(jwtPayload);

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
          authProvider: user.authProvider,
          company: {
            companyName: company.name,
          },
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }
      throw new UnauthorizedError('Google 로그인에 실패했습니다');
    }
  }

  async googleSignup(data: GoogleSignupRequestDto): Promise<LoginResponseDto> {
    try {
      // 1. Google 토큰 검증
      const ticket = await this.googleClient.verifyIdToken({
        idToken: data.token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedError('유효하지 않은 Google 토큰입니다');
      }

      const googleEmail = payload.email;

      // 2. 이메일 중복 체크
      const existingUser = await userRepository.findByEmail(googleEmail);
      if (existingUser) {
        throw new ConflictError('이미 존재하는 이메일입니다');
      }

      // 3. 회사 코드 확인
      const company = await companyRepository.findByCompanyCode(
        data.companyCode.trim(),
      );
      if (!company) {
        throw new BadRequestError('잘못된 기업 인증코드입니다');
      }

      // 4. Google 사용자용 랜덤 비밀번호 생성 (사용자는 Google OAuth로만 로그인)
      const randomPassword = `GOOGLE_${Date.now()}_${Math.random().toString(36)}`;
      const hashedPassword = await hashPassword(randomPassword);

      // 5. 유저 생성 (프론트엔드에서 입력한 이름 사용)
      const user = await userRepository.create({
        email: googleEmail,
        password: hashedPassword,
        name: data.name,
        employeeNumber: data.employeeNumber,
        phoneNumber: data.phoneNumber,
        imageUrl: payload.picture || undefined,
        authProvider: 'google',
        companyId: company.id,
      });

      // 6. JWT 페이로드 생성
      const jwtPayload: JwtPayload = {
        userId: user.id,
        email: user.email,
        companyId: user.companyId,
      };

      // 7. 토큰 생성
      const accessToken = generateAccessToken(jwtPayload);
      const refreshToken = generateRefreshToken(jwtPayload);

      // 8. 응답 데이터 반환
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          employeeNumber: user.employeeNumber,
          phoneNumber: user.phoneNumber || undefined,
          imageUrl: user.imageUrl || undefined,
          isAdmin: user.isAdmin,
          authProvider: user.authProvider,
          company: {
            companyName: company.name,
          },
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof ConflictError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }
      throw new UnauthorizedError('Google 회원가입에 실패했습니다');
    }
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
        companyId: user.companyId,
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

  async googleReauth(
    data: GoogleReauthRequestDto,
    userId: number,
  ): Promise<{ verified: boolean; email: string }> {
    try {
      // 1. Google 토큰 검증
      const ticket = await this.googleClient.verifyIdToken({
        idToken: data.token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedError('유효하지 않은 Google 토큰입니다');
      }

      // 2. 현재 로그인한 유저 조회
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('존재하지 않는 유저입니다');
      }

      // 3. Google 이메일과 현재 유저 이메일이 일치하는지 확인
      if (user.email !== payload.email) {
        throw new UnauthorizedError(
          '인증된 계정이 현재 사용자와 일치하지 않습니다',
        );
      }

      // 4. Google 로그인 사용자인지 확인
      if (user.authProvider !== 'google') {
        throw new BadRequestError('Google 로그인 사용자가 아닙니다');
      }

      return {
        verified: true,
        email: payload.email,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof NotFoundError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }
      throw new UnauthorizedError('Google 재인증에 실패했습니다');
    }
  }
}

export const authService = new AuthService();
