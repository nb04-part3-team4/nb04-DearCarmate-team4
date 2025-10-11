import { CarStatus } from '@prisma/client';
import { BaseCarDto, CarId, UpdateCarData } from '@/types/cars.type.js';

// 차량 기본 요청 DTO
export interface CarRequestDto {
  userId: number;
  data: BaseCarDto;
}

// 차량 기본 응답 DTO
export interface CarResponseDto extends BaseCarDto {
  id: number;
  type: string;
  status: CarStatus;
}

export interface GetCarsResponseDto {
  currentPage: number;
  totalPages: number;
  totalItemCount: number;
  data: CarResponseDto[];
}
export interface GetCarModelsResponseDto {
  data: {
    manufacturer: string;
    model: string[];
  }[];
}

export type CreateCarRequestDto = CarRequestDto;
export type UpdateCarRequestDto = CarId & UpdateCarData;
export type UploadCarsRequestDto = Omit<CarRequestDto, 'data'> & {
  data: BaseCarDto[];
};
