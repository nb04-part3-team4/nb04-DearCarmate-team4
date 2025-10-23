import {
  userRepository,
  UpdateUserInput,
} from '@/features/users/user.repository';
import { companyRepository } from '@/features/companies/company.repository';
import { hashPassword, verifyPassword } from '@/shared/middlewares/password';
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from '@/shared/middlewares/custom-error';
import type {
  SignupResponseDto,
  GetMeResponseDto,
  UpdateMeResponseDto,
  GetUserResponseDto,
  UserResponseDto,
  GetContractUsersResponseDto,
} from '@/features/users/user.dto';
import type { SignupInput, UpdateMeInput } from '@/features/users/user.schema';
import { User, Company } from '@prisma/client';

export class UserService {
  private async toUserResponseDto(
    user: User,
    company: Company,
  ): Promise<UserResponseDto> {
    return {
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
    };
  }

  async signup(data: SignupInput): Promise<SignupResponseDto> {
    const company = await companyRepository.findByCompanyCode(data.companyCode);
    if (!company) {
      throw new BadRequestError('잘못된 요청입니다');
    }

    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('이미 존재하는 이메일입니다');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      employeeNumber: data.employeeNumber,
      phoneNumber: data.phoneNumber,
      imageUrl: undefined,
      companyId: company.id,
    });

    return this.toUserResponseDto(user, company);
  }

  async getMe(userId: number): Promise<GetMeResponseDto> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('존재하지 않는 유저입니다');
    }

    const company = await companyRepository.findById(user.companyId);
    if (!company) {
      throw new NotFoundError('존재하지 않는 회사입니다');
    }

    return this.toUserResponseDto(user, company);
  }

  async updateMe(
    userId: number,
    data: UpdateMeInput,
  ): Promise<UpdateMeResponseDto> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('존재하지 않는 유저입니다');
    }

    const isGoogleUser = user.authProvider === 'google';

    // 일반 사용자: 현재 비밀번호 확인 필요
    // 구글 사용자: 현재 비밀번호 확인 불필요 (프론트엔드에서 구글 재인증 처리)
    if (!isGoogleUser && data.currentPassword) {
      const isPasswordValid = await verifyPassword(
        user.password,
        data.currentPassword,
      );
      if (!isPasswordValid) {
        throw new BadRequestError('현재 비밀번호가 맞지 않습니다');
      }
    }

    const updateData: UpdateUserInput = {};

    // 구글 사용자는 이름 변경 가능
    if (isGoogleUser && data.name !== undefined) {
      updateData.name = data.name;
    }

    // 비밀번호 변경은 일반 사용자만 가능
    if (!isGoogleUser && data.password) {
      updateData.password = await hashPassword(data.password);
    }

    if (data.employeeNumber !== undefined) {
      updateData.employeeNumber = data.employeeNumber;
    }
    if (data.phoneNumber !== undefined) {
      updateData.phoneNumber = data.phoneNumber;
    }
    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl ?? undefined;
    }

    const updatedUser = await userRepository.update(userId, updateData);

    const company = await companyRepository.findById(updatedUser.companyId);
    if (!company) {
      throw new NotFoundError('존재하지 않는 회사입니다');
    }

    return this.toUserResponseDto(updatedUser, company);
  }

  async getUserById(userId: number): Promise<GetUserResponseDto> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('존재하지 않는 유저입니다');
    }

    const company = await companyRepository.findById(user.companyId);
    if (!company) {
      throw new NotFoundError('존재하지 않는 회사입니다');
    }

    return this.toUserResponseDto(user, company);
  }

  async deleteMe(userId: number): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('존재하지 않는 유저입니다');
    }

    await userRepository.delete(userId);
  }
  async getUsersForContract(): Promise<GetContractUsersResponseDto> {
    const users = await userRepository.findAllUsersForContract();

    return users.map((user) => ({
      id: user.id,
      data: `${user.name}(${user.email})`,
    }));
  }
}

export const userService = new UserService();
