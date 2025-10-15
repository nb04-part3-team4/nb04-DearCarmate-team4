import { CarStatus, Prisma } from '@prisma/client';
import z from 'zod';
import { carsBodySchema, SEARCH_BY } from './cars.schema.js';

export type SearchBy = (typeof SEARCH_BY)[number];

export interface CarId {
  carId: number;
}

interface Page {
  page: number;
  pageSize: number;
}

export interface GetListQuery extends Page {
  status?: CarStatus;
  searchBy?: SearchBy;
  keyword?: string;
}

export type BaseCarDto = z.infer<typeof carsBodySchema>;

export interface RawCarCsvData {
  carNumber: string;
  manufacturer: string;
  model: string;
  manufacturingYear: string;
  mileage: string;
  price: string;
  accidentCount: string;
  explanation: string;
  accidentDetails: string;
}

export interface GetListInput {
  skip: number;
  take: number;
  where: Prisma.CarWhereInput;
}

export type CarWithModel = Prisma.CarGetPayload<{ include: { model: true } }>;

export interface CreateCarInput {
  data: Prisma.CarCreateInput;
}

export interface UpdateCarInput extends CarId {
  data: Prisma.CarUpdateInput;
}

export interface UpdateCarData {
  data: Partial<BaseCarDto>;
}
