import {
  CarId,
  CarWithModel,
  GetListQuery,
  UpdateCarData,
} from '@/types/cars.type.js';
import CarRepository from '@/repositories/cars.repository.js';
import {
  CarRequestDto,
  CarResponseDto,
  CreateCarRequestDto,
  GetCarModelsResponseDto,
  GetCarsResponseDto,
  UpdateCarRequestDto,
  UploadCarsRequestDto,
} from '@/dtos/cars.dto.js';
import carModelRepository from '@/repositories/car-model.repository.js';
import { userService } from './user.service.js';
import { companyRepository } from '@/repositories/company.repository.js';
import { BadRequestError, NotFoundError } from '../middlewares/custom-error.js';
import { CarType, Prisma } from '@prisma/client';

class CarService {
  async getCars(query: GetListQuery): Promise<GetCarsResponseDto> {
    const { skip, take, where } = this.buildQueryOptions(query);
    const [cars, totalItemCount] = await Promise.all([
      CarRepository.findMany({ skip, take, where }),
      CarRepository.count(where),
    ]);
    const carsData = cars.map((car) => this.buildCarResponseData(car));
    const { page, pageSize } = query;
    const currentPage = page;
    const totalPages = Math.ceil(totalItemCount / pageSize);
    const result = {
      data: carsData,
      currentPage,
      totalItemCount,
      totalPages,
    };
    return result;
  }
  async getCar({ carId }: CarId) {
    const car = await CarRepository.findById({ carId });
    if (!car) {
      throw new NotFoundError('존재하지 않는 차량입니다.');
    }
    return this.buildCarResponseData(car);
  }
  async createCar({
    userId,
    data,
  }: CreateCarRequestDto): Promise<CarResponseDto> {
    const createData = await this.buildCarData({ userId, data });
    const car = await CarRepository.create({ data: createData });
    return this.buildCarResponseData(car);
  }
  async updateCar({
    carId,
    data,
  }: UpdateCarRequestDto): Promise<CarResponseDto> {
    const car = await CarRepository.findById({ carId });
    if (!car) {
      throw new NotFoundError('존재하지 않는 차량입니다');
    }
    const updateData = await this.buildCarUpdateData({ data });
    const updatedCar = await CarRepository.update({ carId, data: updateData });
    return this.buildCarResponseData(updatedCar);
  }
  async deleteCar({ carId }: CarId) {
    const car = await CarRepository.findById({ carId });
    if (!car) {
      throw new NotFoundError('존재하지 않는 차량입니다');
    }
    await CarRepository.delete({ carId });
  }
  async getCarModels(): Promise<GetCarModelsResponseDto> {
    const allModels = await carModelRepository.findMany();
    const groupedData = {} as Record<string, string[]>;
    allModels.forEach((cur) => {
      const { manufacturer, model } = cur;
      if (!groupedData[manufacturer]) {
        groupedData[manufacturer] = [];
      }
      groupedData[manufacturer].push(model);
    });
    const responseData = Object.entries(groupedData).map(
      ([manufacturer, model]) => ({
        manufacturer,
        model,
      }),
    );
    return {
      data: responseData,
    };
  }
  async uploadCars({ userId, data }: UploadCarsRequestDto) {
    const createManyData = await Promise.all(
      data.map((car) => {
        return this.buildManyCarData({ userId, data: car });
      }),
    );
    await CarRepository.createMany(createManyData);
  }

  private buildCarResponseData(car: CarWithModel) {
    return {
      id: car.id,
      carNumber: car.carNumber,
      manufacturer: car.model.manufacturer,
      model: car.model.model,
      type: this.translateCarTypeToKorean(car.model.type),
      manufacturingYear: car.manufacturingYear,
      mileage: car.mileage,
      price: car.price,
      accidentCount: car.accidentCount,
      explanation: car.explanation ?? '',
      accidentDetails: car.accidentDetails ?? '',
      status: car.status,
    };
  }
  private async getCompanyCode(userId: number) {
    const user = await userService.getMe(userId);
    return user.company;
  }
  private async getCompanyId(companyCode: string) {
    return await companyRepository.findByCompanyCode(companyCode);
  }
  private async getModelId(manufacturer: string, model: string) {
    return await carModelRepository.findUnique({
      manufacturer,
      model,
    });
  }
  private translateCarTypeToKorean(type: CarType): string {
    switch (type) {
      case 'SEDAN':
        return '세단';
      case 'COMPACT':
        return '경차';
      case 'SUV':
        return 'SUV';
      default:
        return type;
    }
  }
  /**
   * 차량 데이터의 공통 부분을 추출하는 헬퍼 메서드
   */
  private extractBaseCarData(data: CarRequestDto['data']) {
    return {
      carNumber: data.carNumber,
      manufacturingYear: data.manufacturingYear,
      mileage: data.mileage,
      price: data.price,
      accidentCount: data.accidentCount,
      explanation: data.explanation,
      accidentDetails: data.accidentDetails,
    };
  }

  /**
   * 단일 차량 생성을 위한 데이터 빌드 (Prisma connect 사용)
   */
  private async buildCarData({ userId, data }: CarRequestDto) {
    const { companyCode } = await this.getCompanyCode(userId);
    const { manufacturer, model } = data;
    const carModel = await this.getModelId(manufacturer, model);
    if (!carModel) {
      throw new BadRequestError('잘못된 요청입니다.');
    }
    return {
      ...this.extractBaseCarData(data),
      company: {
        connect: { companyCode },
      },
      model: {
        connect: { id: carModel.id },
      },
    };
  }

  private async buildCarUpdateData({ data }: UpdateCarData) {
    const { manufacturer, model, ...restData } = data;
    const updateData: Prisma.CarUpdateInput = { ...restData };
    if (manufacturer && model) {
      const carModel = await carModelRepository.findUnique({
        manufacturer,
        model,
      });
      if (!carModel) {
        throw new BadRequestError('잘못된 요청입니다.');
      }
      updateData.model = { connect: { id: carModel.id } };
    }
    return updateData;
  }

  /**
   * 대량 차량 생성을 위한 데이터 빌드 (createMany용 - ID 직접 사용)
   */
  private async buildManyCarData({ userId, data }: CarRequestDto) {
    const { companyCode } = await this.getCompanyCode(userId);
    const company = await this.getCompanyId(companyCode);
    if (!company) {
      throw new NotFoundError('해당 회사를 찾을 수 없습니다.');
    }
    const { manufacturer, model } = data;
    const carModel = await this.getModelId(manufacturer, model);
    if (!carModel) {
      throw new BadRequestError('잘못된 요청입니다.');
    }
    return {
      ...this.extractBaseCarData(data),
      companyId: company.id,
      modelId: carModel.id,
    };
  }
  private buildQueryOptions({
    page,
    pageSize,
    status,
    searchBy,
    keyword,
  }: GetListQuery) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const where: Prisma.CarWhereInput = {
      ...(status && { status }),
      ...(keyword && searchBy === 'carNumber'
        ? { carNumber: { contains: keyword, mode: 'insensitive' } }
        : {}),
      ...(keyword && searchBy === 'model'
        ? { model: { model: { contains: keyword, mode: 'insensitive' } } }
        : {}),
    };
    return { skip, take, where };
  }
}

export default new CarService();
