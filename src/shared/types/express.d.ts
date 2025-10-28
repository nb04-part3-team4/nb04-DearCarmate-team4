import { JwtPayload } from '@/middlewares/jwt';
import { BaseCarDto } from './cars.type.js';
import { CreateCustomerInput } from '@/features/customers/customer.schema.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      file?: Express.Multer.File;
      files?:
        | Express.Multer.File[]
        | { [fieldname: string]: Express.Multer.File[] };
      parsedCsvData?: BaseCarDto[];
      parsedCustomerCsvData?: CreateCustomerInput[];
    }
  }
}

export {};
