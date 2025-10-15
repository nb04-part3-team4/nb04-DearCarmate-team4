import { RequestHandler } from 'express';
import { BadRequestError } from '@/utils/custom-error.js';
import { BaseCarDto, RawCarCsvData } from '@/types/cars.type.js';
import { Readable } from 'stream';
import csvParser from 'csv-parser';

export const carsCsvParser: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('파일이 없습니다.');
    }
    const file = req.file;
    const rawData: RawCarCsvData[] = await new Promise((resolve, reject) => {
      const results: RawCarCsvData[] = [];
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);
      bufferStream
        .pipe(csvParser())
        .on('data', (data: RawCarCsvData) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
    const carDtos: BaseCarDto[] = rawData.map((row) => {
      const manufacturingYear = parseInt(row.manufacturingYear, 10) || 0;
      const mileage = parseInt(row.mileage, 10) || 0;
      const price = parseInt(row.price, 10) || 0;
      const accidentCount = parseInt(row.accidentCount, 10) || 0;
      return {
        carNumber: row.carNumber,
        manufacturer: row.manufacturer,
        model: row.model,
        manufacturingYear,
        mileage,
        price,
        accidentCount,
        explanation: row.explanation || null,
        accidentDetails: row.accidentDetails || null,
      };
    });
    req.parsedCsvData = carDtos;
    next();
  } catch (e) {
    next(e);
  }
};
