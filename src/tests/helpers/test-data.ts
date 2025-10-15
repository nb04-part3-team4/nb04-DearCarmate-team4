import prisma from '@/middlewares/prisma';
import { hashPassword } from '@/middlewares/password';
import type { Company, User, Car } from '@prisma/client';

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

export async function createTestCar(
  companyId: number,
  data: Partial<{
    carNumber: string;
    manufacturer: string;
    model: string;
    manufacturingYear: number;
    mileage: number;
    price: number;
    accidentCount: number;
    explanation: string;
    accidentDetails: string;
  }> = {},
): Promise<Car> {
  // Find the car model from seed data
  const carModel = await prisma.carModel.findFirst({
    where: {
      manufacturer: data.manufacturer || '기아',
      model: data.model || 'K5',
    },
  });

  if (!carModel) {
    throw new Error(
      `Car model not found: ${data.manufacturer || '기아'} ${data.model || 'K5'}`,
    );
  }

  return await prisma.car.create({
    data: {
      carNumber: data.carNumber || '12가1234',
      manufacturingYear: data.manufacturingYear || 2020,
      mileage: data.mileage || 0,
      price: data.price || 1000000,
      accidentCount: data.accidentCount || 0,
      explanation: data.explanation,
      accidentDetails: data.accidentDetails,
      companyId,
      modelId: carModel.id,
    },
  });
}
