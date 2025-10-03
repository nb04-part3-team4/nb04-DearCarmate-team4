import { userRepository, UpdateUserData } from '@/repositories/user.repository';
import { companyRepository } from '@/repositories/company.repository';
import { hashPassword, verifyPassword } from '@/utils/password';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
} from '@/utils/custom-error';
import type {
  SignupRequestDto,
  SignupResponseDto,
  GetMeResponseDto,
  UpdateMeRequestDto,
  UpdateMeResponseDto,
  GetUserResponseDto,
} from '@/dtos/user.dto';
import {
  BaseUserDto,
  UserDtoWithCreatedAt,
  UserDtoWithTimestamps,
} from '@/types/user.types';
import { User } from '@prisma/client';

export class UserService {
  // User 엔티티를 DTO로 변환
  private toUserDto(
    user: User,
    includeTimestamps: 'all' | 'createdAt' | 'none' = 'all',
  ): BaseUserDto | UserDtoWithCreatedAt | UserDtoWithTimestamps {
    const baseDto: BaseUserDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      employeeNumber: user.employeeNumber,
      phoneNumber: user.phoneNumber || undefined,
      imageUrl: user.imageUrl || undefined,
      isAdmin: user.isAdmin,
      companyId: user.companyId,
    };

    if (includeTimestamps === 'all') {
      return {
        ...baseDto,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      } as UserDtoWithTimestamps;
    } else if (includeTimestamps === 'createdAt') {
      return {
        ...baseDto,
        createdAt: user.createdAt,
      } as UserDtoWithCreatedAt;
    }

    return baseDto;
  }

  // 기업 코드 검증
  private async validateCompanyCode(companyCode: string) {
    const company = await companyRepository.findByCompanyCode(companyCode);
    if (!company) {
      throw new BadRequestError('Invalid company code');
    }
    return company;
  }

  // 이메일 중복 검증
  private async validateEmailUniqueness(email: string) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }
  }

  // 사원번호 중복 검증
  private async validateEmployeeNumberUniqueness(employeeNumber: string) {
    const existingUser =
      await userRepository.findByEmployeeNumber(employeeNumber);
    if (existingUser) {
      throw new ConflictError('Employee number already exists');
    }
  }

  // 회원가입 데이터 검증
  private async validateSignupData(data: SignupRequestDto) {
    const company = await this.validateCompanyCode(data.companyCode);
    await this.validateEmailUniqueness(data.email);
    await this.validateEmployeeNumberUniqueness(data.employeeNumber);
    return company;
  }

  // 사용자 생성
  private async createUserWithHashedPassword(
    data: Omit<SignupRequestDto, 'companyCode'>,
    companyId: number,
  ) {
    const hashedPassword = await hashPassword(data.password);

    return await userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      employeeNumber: data.employeeNumber,
      phoneNumber: data.phoneNumber,
      imageUrl: data.imageUrl,
      companyId,
    });
  }

  async signup(data: SignupRequestDto): Promise<SignupResponseDto> {
    // 1. 데이터 검증
    const company = await this.validateSignupData(data);

    // 2. 유저 생성
    const user = await this.createUserWithHashedPassword(data, company.id);

    // 3. 응답 반환
    return this.toUserDto(user, 'createdAt') as SignupResponseDto;
  }

  async getMe(userId: number): Promise<GetMeResponseDto> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.toUserDto(user, 'all') as GetMeResponseDto;
  }

  async updateMe(
    userId: number,
    data: UpdateMeRequestDto,
  ): Promise<UpdateMeResponseDto> {
    const { password, newPassword, name, phoneNumber, imageUrl } = data;

    // 1. 유저 조회
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 2. 현재 비밀번호 확인
    const isPasswordValid = await verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid password');
    }

    // 3. 업데이트할 데이터 준비
    const updateData: UpdateUserData = {};

    if (newPassword) {
      updateData.password = await hashPassword(newPassword);
    }
    if (name !== undefined) {
      updateData.name = name;
    }
    if (phoneNumber !== undefined) {
      updateData.phoneNumber = phoneNumber;
    }
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }

    // 4. 유저 정보 업데이트
    const updatedUser = await userRepository.update(userId, updateData);

    // 5. 응답 반환
    return {
      ...this.toUserDto(updatedUser, 'all'),
      updatedAt: updatedUser.updatedAt,
    } as UpdateMeResponseDto;
  }

  async getUserById(userId: number): Promise<GetUserResponseDto> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.toUserDto(user, 'all') as GetUserResponseDto;
  }
}

export const userService = new UserService();
