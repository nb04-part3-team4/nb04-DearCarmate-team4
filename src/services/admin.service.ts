import { userRepository } from '@/repositories/user.repository';
import { NotFoundError, ForbiddenError } from '@/utils/custom-error';

export class AdminService {
  async deleteUser(userId: number): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isAdmin) {
      throw new ForbiddenError('Cannot delete admin user');
    }

    await userRepository.delete(userId);
  }
}

export const adminService = new AdminService();
