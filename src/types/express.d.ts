import { JwtPayload } from '@/utils/jwt';
import { BaseCarDto } from './cars.type.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      file?: Express.Multer.File;
      files?:
        | Express.Multer.File[]
        | { [fieldname: string]: Express.Multer.File[] };
      parsedCsvData?: BaseCarDto[];
    }
  }
}

export {};
