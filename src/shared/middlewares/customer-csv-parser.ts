import { RequestHandler } from 'express';
import { BadRequestError } from '@/shared/middlewares/custom-error.js';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import {
  CreateCustomerInput,
  createCustomerSchema,
} from '@/features/customers/customer.schema.js';
import { RawCustomerCsvData } from '@/features/customers/customer.type.js';

export const customerCsvParser: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('파일이 없습니다.');
    }
    const file = req.file;
    const rawData: RawCustomerCsvData[] = await new Promise(
      (resolve, reject) => {
        const results: RawCustomerCsvData[] = [];
        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);
        bufferStream
          .pipe(csvParser())
          .on('data', (data: RawCustomerCsvData) => results.push(data))
          .on('end', () => resolve(results))
          .on('error', reject);
      },
    );
    const customerDtos: CreateCustomerInput[] = rawData.map((row) => {
      let parsedAgeGroup = '';
      const ageStart = row.ageGroup.split('-')[0];
      if (ageStart && /^\d+$/.test(ageStart)) {
        parsedAgeGroup = `${ageStart}대`;
      } else {
        parsedAgeGroup = '';
      }
      row = {
        ...row,
        ageGroup: parsedAgeGroup,
      };
      const parsedRow = createCustomerSchema.parse(row);
      return {
        name: parsedRow.name,
        email: parsedRow.email,
        gender: parsedRow.gender,
        phoneNumber: parsedRow.phoneNumber,
        region: parsedRow.region,
        ageGroup: parsedRow.ageGroup,
        memo: parsedRow.memo,
      };
    });
    req.parsedCustomerCsvData = customerDtos;
    next();
  } catch (e) {
    next(e);
  }
};
