import * as dashboardRepository from './dashboard.repository.js';
import { DashboardResponseDto } from './dashboard.dto.js';
// import { CarType } from '@prisma/client';

/* const carTypeMapping: Record<CarType, string> = {
  [CarType.COMPACT]: '경·소형',
  [CarType.SEDAN]: '준중·중형',
  [CarType.SUV]: 'SUV',
}; */

export const getDashboardData = async (
  userId: number,
): Promise<DashboardResponseDto> => {
  const [
    monthlySales,
    lastMonthSales,
    proceedingContractsCount,
    completedContractsCount,
    contractsCountByCarType,
    salesByCarTypeData,
  ] = await Promise.all([
    dashboardRepository.getMonthlySales(userId),
    dashboardRepository.getLastMonthSales(userId),
    dashboardRepository.getProceedingContractsCount(userId),
    dashboardRepository.getCompletedContractsCount(userId),
    dashboardRepository.getContractsCountByCarType(userId),
    dashboardRepository.getSalesByCarType(userId),
  ]);

  const growthRate =
    lastMonthSales === 0
      ? null
      : (monthlySales - lastMonthSales) / lastMonthSales;

  const contractsByCarType = Object.entries(contractsCountByCarType).map(
    ([type, count]) => ({
      carType: type || '기타',
      count,
    }),
  );

  const salesByCarType = Object.entries(salesByCarTypeData).map(
    ([type, sales]) => ({
      carType: type || '기타',
      count: sales / 10000,
    }),
  );
  return {
    monthlySales,
    lastMonthSales,
    growthRate,
    proceedingContractsCount,
    completedContractsCount,
    contractsByCarType,
    salesByCarType,
  };
};
