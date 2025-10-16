import { userRepository } from '@/features/users/user.repository';
import {
  NotFoundError,
  ForbiddenError,
} from '@/shared/middlewares/custom-error';

export class AdminService {
  async deleteUser(userId: number): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('존재하지 않는 유저입니다');
    }

    if (user.isAdmin) {
      throw new ForbiddenError('관리자는 삭제할 수 없습니다');
    }

    await userRepository.delete(userId);
  }
}

export const adminService = new AdminService();
