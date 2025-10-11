import { JwtPayload } from '@/utils/jwt';
import { BaseCarDto } from './cars.type.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      parsedCsvData?: BaseCarDto[];
    }
  }
}

export {};
