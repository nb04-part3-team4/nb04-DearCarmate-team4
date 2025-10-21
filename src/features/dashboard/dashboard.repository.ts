import prisma from '../../shared/middlewares/prisma.js';
import { CarType } from '@prisma/client';

const now = new Date();
const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

const getSalesBetween = async (
  userId: number,
  startDate: Date,
  endDate: Date,
) => {
  const result = await prisma.contract.aggregate({
    where: {
      userId,
      status: 'contractSuccessful',
      resolutionDate: {
        gte: startDate,
        lt: endDate,
      },
    },
    _sum: {
      contractPrice: true,
    },
  });

  return result._sum.contractPrice || 0;
};

export const getMonthlySales = async (userId: number) => {
  return getSalesBetween(userId, firstDayOfCurrentMonth, firstDayOfNextMonth);
};

export const getLastMonthSales = async (userId: number) => {
  return getSalesBetween(userId, firstDayOfLastMonth, firstDayOfCurrentMonth);
};

export const getCompletedContractsCount = async (userId: number) => {
  return prisma.contract.count({
    where: { userId, status: 'contractSuccessful' },
  });
};

export const getProceedingContractsCount = async (userId: number) => {
  return prisma.contract.count({
    where: {
      userId,
      NOT: {
        status: {
          in: ['contractSuccessful', 'contractCancelled'],
        },
      },
    },
  });
};

export const getContractsCountByCarType = async (userId: number) => {
  const carTypes = Object.values(CarType);
  const count: Record<CarType, number> = {} as Record<CarType, number>;

  for (const type of carTypes) {
    const result = await prisma.contract.count({
      where: {
        userId,
        car: {
          model: {
            type,
          },
        },
      },
    });
    count[type] = result;
  }

  return count;
};

export const getSalesByCarType = async (userId: number) => {
  const carTypes = Object.values(CarType);
  const sales: Record<CarType, number> = {} as Record<CarType, number>;

  for (const type of carTypes) {
    const result = await prisma.contract.aggregate({
      where: {
        userId,
        status: 'contractSuccessful',
        car: {
          model: {
            type,
          },
        },
      },
      _sum: {
        contractPrice: true,
      },
    });
    sales[type] = result._sum.contractPrice || 0;
  }

  return sales;
};
