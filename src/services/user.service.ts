import { userRepository } from '@/repositories/user.repository';
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

export class UserService {
  async signup(data: SignupRequestDto): Promise<SignupResponseDto> {
    const {
      email,
      password,
      name,
      employeeNumber,
      phoneNumber,
      companyCode,
      imageUrl,
    } = data;

    // 1. 기업 인증코드 검증
    const company = await companyRepository.findByCompanyCode(companyCode);
    if (!company) {
      throw new BadRequestError('Invalid company code');
    }

    // 2. 이메일 중복 확인
    const existingUserByEmail = await userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictError('Email already exists');
    }

    // 3. 사원번호 중복 확인
    const existingUserByEmployeeNumber =
      await userRepository.findByEmployeeNumber(employeeNumber);
    if (existingUserByEmployeeNumber) {
      throw new ConflictError('Employee number already exists');
    }

    // 4. 비밀번호 해싱
    const hashedPassword = await hashPassword(password);

    // 5. 유저 생성
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      employeeNumber,
      phoneNumber,
      imageUrl,
      companyId: company.id,
    });

    // 6. 응답 반환
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      employeeNumber: user.employeeNumber,
      phoneNumber: user.phoneNumber || undefined,
      imageUrl: user.imageUrl || undefined,
      isAdmin: user.isAdmin,
      companyId: user.companyId,
      createdAt: user.createdAt,
    };
  }

  async getMe(userId: number): Promise<GetMeResponseDto> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      employeeNumber: user.employeeNumber,
      phoneNumber: user.phoneNumber || undefined,
      imageUrl: user.imageUrl || undefined,
      isAdmin: user.isAdmin,
      companyId: user.companyId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
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
    const updateData: {
      password?: string;
      name?: string;
      phoneNumber?: string;
      imageUrl?: string;
    } = {};

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
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      employeeNumber: updatedUser.employeeNumber,
      phoneNumber: updatedUser.phoneNumber || undefined,
      imageUrl: updatedUser.imageUrl || undefined,
      isAdmin: updatedUser.isAdmin,
      companyId: updatedUser.companyId,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async getUserById(userId: number): Promise<GetUserResponseDto> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      employeeNumber: user.employeeNumber,
      phoneNumber: user.phoneNumber || undefined,
      imageUrl: user.imageUrl || undefined,
      isAdmin: user.isAdmin,
      companyId: user.companyId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const userService = new UserService();
