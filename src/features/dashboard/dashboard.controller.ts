import { RequestHandler } from 'express';
import * as dashboardService from './dashboard.service.js';

export const getDashboard: RequestHandler = async (req, res, next) => {
  const userId = req.user?.userId;

  if (!userId) {
    return next(new Error('로그인이 필요합니다'));
  }

  try {
    const dashboardData = await dashboardService.getDashboardData(userId);

    if (!dashboardData) {
      return next(new Error('대시보드 데이터를 불러올 수 없습니다'));
    }

    res.status(200).json(dashboardData);
  } catch (error) {
    next(error);
  }
};
