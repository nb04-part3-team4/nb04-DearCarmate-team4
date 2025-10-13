import z from 'zod';
import { BaseCarDto, CarId, UpdateCarData } from '@/types/cars.type.js';
import {
  carResponseSchema,
  getCarModelsResponseSchema,
  getCarsResponseSchema,
} from '@/types/cars.schema.js';

// 차량 기본 요청 DTO
export interface CarRequestDto {
  userId: number;
  data: BaseCarDto;
}

// 차량 요청 DTO
export type CreateCarRequestDto = CarRequestDto;
export type UpdateCarRequestDto = CarId & UpdateCarData;
export type UploadCarsRequestDto = Omit<CarRequestDto, 'data'> & {
  data: BaseCarDto[];
};

// 차량 응답 DTO
export type CarResponseDto = z.infer<typeof carResponseSchema>;
export type GetCarsResponseDto = z.infer<typeof getCarsResponseSchema>;
export type GetCarModelsResponseDto = z.infer<
  typeof getCarModelsResponseSchema
>;
