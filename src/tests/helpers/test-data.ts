import prisma from '@/utils/prisma';
import { hashPassword } from '@/utils/password';
import type { Company, User } from '@prisma/client';

export async function createTestCompany(
  data: Partial<{ name: string; companyCode: string }> = {},
): Promise<Company> {
  return await prisma.company.create({
    data: {
      name: data.name || 'Test Company',
      companyCode: data.companyCode || 'TEST001',
    },
  });
}

export async function createTestUser(
  companyId: number,
  data: Partial<{
    email: string;
    password: string;
    name: string;
    employeeNumber: string;
    phoneNumber?: string;
    isAdmin: boolean;
  }> = {},
): Promise<User> {
  const hashedPassword = await hashPassword(data.password || 'password123');

  return await prisma.user.create({
    data: {
      email: data.email || 'test@example.com',
      password: hashedPassword,
      name: data.name || 'Test User',
      employeeNumber: data.employeeNumber || 'EMP001',
      phoneNumber: data.phoneNumber,
      isAdmin: data.isAdmin || false,
      companyId,
    },
  });
}

export async function createTestAdmin(companyId: number): Promise<User> {
  return await createTestUser(companyId, {
    email: 'admin@example.com',
    employeeNumber: 'ADMIN001',
    name: 'Test Admin',
    isAdmin: true,
  });
}
