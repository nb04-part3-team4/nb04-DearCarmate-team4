import { describe, it, expect, beforeEach, vi } from 'vitest';
import carsService from '@/services/cars.service';
import { createTestCompany, createTestUser } from '../helpers/test-data';
import { BadRequestError, NotFoundError } from '@/middlewares/custom-error';
import carModelRepository from '@/repositories/car-model.repository';
import carRepository from '@/repositories/cars.repository';
import { CarType, CarStatus } from '@prisma/client';
import type { CarWithModel } from '@/types/cars.type';

// Mock repositories
vi.mock('@/repositories/car-model.repository');
vi.mock('@/repositories/cars.repository');

// Global helpers interface
interface GlobalHelpers {
  addMockCar: (car: CarWithModel) => void;
  clearMockCars: () => void;
}

describe('CarService', () => {
  let companyId: number;
  let userId: number;

  const mockCarModels = [
    // 기아
    { id: 1, manufacturer: '기아', model: 'K3', type: CarType.SEDAN },
    { id: 2, manufacturer: '기아', model: 'K5', type: CarType.SEDAN },
    { id: 3, manufacturer: '기아', model: 'K7', type: CarType.SEDAN },
    { id: 4, manufacturer: '기아', model: '쏘렌토', type: CarType.SUV },
    { id: 5, manufacturer: '기아', model: '모닝', type: CarType.COMPACT },
    // 현대
    { id: 6, manufacturer: '현대', model: '아반떼', type: CarType.SEDAN },
    { id: 7, manufacturer: '현대', model: '그랜저', type: CarType.SEDAN },
    { id: 8, manufacturer: '현대', model: '싼타페', type: CarType.SUV },
    // 쉐보레
    { id: 9, manufacturer: '쉐보레', model: '스파크', type: CarType.COMPACT },
  ];

  beforeEach(async () => {
    const company = await createTestCompany({
      name: 'Car Test Company',
      companyCode: 'CAR001',
    });
    companyId = company.id;

    const user = await createTestUser(companyId, {
      email: 'cartest@example.com',
      name: 'Car Test User',
      employeeNumber: 'EMPCAR001',
    });
    userId = user.id;

    // Mock carModelRepository.findUnique
    vi.mocked(carModelRepository.findUnique).mockImplementation(
      async ({ manufacturer, model }) => {
        const foundModel = mockCarModels.find(
          (m) => m.manufacturer === manufacturer && m.model === model,
        );
        return Promise.resolve(foundModel || null);
      },
    );

    // Mock carModelRepository.findMany
    vi.mocked(carModelRepository.findMany).mockResolvedValue(mockCarModels);

    // Mock carRepository.create
    vi.mocked(carRepository.create).mockImplementation(
      async ({ data: createData }) => {
        const { model, ...scalarData } = createData;
        if (!model?.connect?.id) {
          throw new BadRequestError(
            'Mock Error: createData에 model.connect.id가 없습니다.',
          );
        }

        const connectedModelId = model.connect.id;
        const connectedModel = mockCarModels.find(
          (m) => m.id === connectedModelId,
        );

        if (!connectedModel) {
          throw new BadRequestError(
            `Mock Error: Cannot find model with id ${connectedModelId}`,
          );
        }

        return {
          id: Math.floor(Math.random() * 1000),
          carNumber: scalarData.carNumber,
          manufacturingYear: scalarData.manufacturingYear,
          price: scalarData.price,
          mileage: scalarData.mileage ?? 0,
          accidentCount: scalarData.accidentCount ?? 0,
          explanation: scalarData.explanation ?? null,
          accidentDetails: scalarData.accidentDetails ?? null,
          companyId: companyId,
          modelId: connectedModel.id,
          status: CarStatus.possession,
          createdAt: new Date(),
          updatedAt: new Date(),
          imageUrl: null,
          model: connectedModel,
        };
      },
    );

    // Mock carRepository.findById
    let mockCars: CarWithModel[] = [];
    vi.mocked(carRepository.findById).mockImplementation(async ({ carId }) => {
      return mockCars.find((car) => car.id === carId) || null;
    });

    // Mock carRepository.findMany
    vi.mocked(carRepository.findMany).mockImplementation(
      async ({ skip, take }) => {
        return mockCars.slice(skip, skip + take);
      },
    );

    // Mock carRepository.count
    vi.mocked(carRepository.count).mockImplementation(async () => {
      return mockCars.length;
    });

    // Mock carRepository.update
    vi.mocked(carRepository.update).mockImplementation(
      async ({ carId, data }) => {
        const carIndex = mockCars.findIndex((car) => car.id === carId);
        if (carIndex === -1) {
          throw new NotFoundError('Car not found');
        }

        const currentCar = mockCars[carIndex];
        let updatedModel = currentCar.model;
        let updatedModelId = currentCar.modelId;

        if (data.model?.connect?.id) {
          const connectedModel = mockCarModels.find(
            (m) => m.id === data.model!.connect!.id,
          );
          if (connectedModel) {
            updatedModel = connectedModel;
            updatedModelId = connectedModel.id;
          }
        }

        const updatedCar: CarWithModel = {
          ...currentCar,
          carNumber:
            typeof data.carNumber === 'string'
              ? data.carNumber
              : currentCar.carNumber,
          manufacturingYear:
            typeof data.manufacturingYear === 'number'
              ? data.manufacturingYear
              : currentCar.manufacturingYear,
          mileage:
            typeof data.mileage === 'number'
              ? data.mileage
              : currentCar.mileage,
          price: typeof data.price === 'number' ? data.price : currentCar.price,
          accidentCount:
            typeof data.accidentCount === 'number'
              ? data.accidentCount
              : currentCar.accidentCount,
          explanation:
            typeof data.explanation === 'string' || data.explanation === null
              ? data.explanation
              : currentCar.explanation,
          accidentDetails:
            typeof data.accidentDetails === 'string' ||
            data.accidentDetails === null
              ? data.accidentDetails
              : currentCar.accidentDetails,
          model: updatedModel,
          modelId: updatedModelId,
          updatedAt: new Date(),
        };

        mockCars[carIndex] = updatedCar;
        return updatedCar;
      },
    );

    // Mock carRepository.delete
    vi.mocked(carRepository.delete).mockImplementation(async ({ carId }) => {
      const carIndex = mockCars.findIndex((car) => car.id === carId);
      if (carIndex === -1) {
        throw new NotFoundError('Car not found');
      }
      const deletedCar = mockCars[carIndex];
      mockCars.splice(carIndex, 1);
      return deletedCar;
    });

    // Helper to add mock car
    (global as unknown as GlobalHelpers).addMockCar = (car: CarWithModel) => {
      mockCars.push(car);
    };

    // Helper to clear mock cars
    (global as unknown as GlobalHelpers).clearMockCars = () => {
      mockCars = [];
    };
  });

  describe('createCar', () => {
    it('should create a new car with valid data', async () => {
      const carData = {
        carNumber: '12가1234',
        manufacturer: '기아',
        model: 'K5',
        manufacturingYear: 2020,
        mileage: 30,
        price: 1000000,
        accidentCount: 1,
        explanation: '테스트 사고',
        accidentDetails: '테스트 차량 사고 내용입니다',
      };

      const result = await carsService.createCar({ userId, data: carData });

      expect(result).toHaveProperty('id');
      expect(result.carNumber).toBe(carData.carNumber);
      expect(result.manufacturer).toBe(carData.manufacturer);
      expect(result.model).toBe(carData.model);
      expect(result.type).toBe('세단');
      expect(result.manufacturingYear).toBe(carData.manufacturingYear);
      expect(result.mileage).toBe(carData.mileage);
      expect(result.price).toBe(carData.price);
      expect(result.accidentCount).toBe(carData.accidentCount);
      expect(result.explanation).toBe(carData.explanation);
      expect(result.accidentDetails).toBe(carData.accidentDetails);
      expect(result.status).toBe('possession');
    });

    it('should create a car with SUV type', async () => {
      const carData = {
        carNumber: '34나5678',
        manufacturer: '현대',
        model: '싼타페',
        manufacturingYear: 2021,
        mileage: 50,
        price: 2000000,
        accidentCount: 0,
        explanation: null,
        accidentDetails: null,
      };

      const result = await carsService.createCar({ userId, data: carData });

      expect(result.manufacturer).toBe('현대');
      expect(result.model).toBe('싼타페');
      expect(result.type).toBe('SUV');
    });

    it('should create a car with COMPACT type', async () => {
      const carData = {
        carNumber: '56다9012',
        manufacturer: '기아',
        model: '모닝',
        manufacturingYear: 2019,
        mileage: 100,
        price: 500000,
        accidentCount: 0,
        explanation: null,
        accidentDetails: null,
      };

      const result = await carsService.createCar({ userId, data: carData });

      expect(result.manufacturer).toBe('기아');
      expect(result.model).toBe('모닝');
      expect(result.type).toBe('경차');
    });

    it('should throw BadRequestError with invalid manufacturer', async () => {
      const carData = {
        carNumber: '12가1234',
        manufacturer: 'invalid',
        model: 'K5',
        manufacturingYear: 2020,
        mileage: 30,
        price: 1000000,
        accidentCount: 1,
        explanation: null,
        accidentDetails: null,
      };

      await expect(
        carsService.createCar({ userId, data: carData }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError with invalid model', async () => {
      const carData = {
        carNumber: '12가1234',
        manufacturer: '기아',
        model: 'invalid',
        manufacturingYear: 2020,
        mileage: 30,
        price: 1000000,
        accidentCount: 1,
        explanation: null,
        accidentDetails: null,
      };

      await expect(
        carsService.createCar({ userId, data: carData }),
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('getCar', () => {
    it('should get car data by carId', async () => {
      const mockCar: CarWithModel = {
        id: 1,
        carNumber: '78라3456',
        manufacturingYear: 2022,
        mileage: 20,
        price: 3000000,
        accidentCount: 0,
        explanation: null,
        accidentDetails: null,
        companyId,
        modelId: 7,
        status: CarStatus.possession,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: null,
        model: mockCarModels[6], // 그랜저
      };

      (global as unknown as GlobalHelpers).addMockCar(mockCar);

      const result = await carsService.getCar({ carId: 1 });

      expect(result.id).toBe(1);
      expect(result.carNumber).toBe('78라3456');
      expect(result.manufacturer).toBe('현대');
      expect(result.model).toBe('그랜저');
      expect(result.type).toBe('세단');
      expect(result.manufacturingYear).toBe(2022);
    });

    it('should throw NotFoundError when car does not exist', async () => {
      await expect(carsService.getCar({ carId: 99999 })).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('getCars', () => {
    beforeEach(() => {
      (global as unknown as GlobalHelpers).addMockCar({
        id: 1,
        carNumber: '11가1111',
        manufacturingYear: 2020,
        mileage: 0,
        price: 1000000,
        accidentCount: 0,
        explanation: null,
        accidentDetails: null,
        companyId,
        modelId: 1,
        status: CarStatus.possession,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: null,
        model: mockCarModels[0], // K3
      });

      (global as unknown as GlobalHelpers).addMockCar({
        id: 2,
        carNumber: '22나2222',
        manufacturingYear: 2021,
        mileage: 0,
        price: 1500000,
        accidentCount: 0,
        explanation: null,
        accidentDetails: null,
        companyId,
        modelId: 2,
        status: CarStatus.possession,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: null,
        model: mockCarModels[1], // K5
      });

      (global as unknown as GlobalHelpers).addMockCar({
        id: 3,
        carNumber: '33다3333',
        manufacturingYear: 2022,
        mileage: 0,
        price: 1200000,
        accidentCount: 0,
        explanation: null,
        accidentDetails: null,
        companyId,
        modelId: 6,
        status: CarStatus.possession,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: null,
        model: mockCarModels[5], // 아반떼
      });
    });

    it('should return paginated cars list', async () => {
      const result = await carsService.getCars({
        page: 1,
        pageSize: 10,
      });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBeGreaterThan(0);
      expect(result.totalItemCount).toBeGreaterThan(0);
    });

    it('should return cars with correct structure', async () => {
      const result = await carsService.getCars({
        page: 1,
        pageSize: 10,
      });

      expect(result.data.length).toBeGreaterThan(0);
      const car = result.data[0];
      expect(car.id).toBeDefined();
      expect(car.carNumber).toBeDefined();
      expect(car.manufacturer).toBeDefined();
      expect(car.model).toBeDefined();
      expect(car.type).toBeDefined();
      expect(car.status).toBeDefined();
    });

    it('should support search by carNumber', async () => {
      const result = await carsService.getCars({
        page: 1,
        pageSize: 10,
        searchBy: 'carNumber',
        keyword: '11가1111',
      });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should support search by model', async () => {
      const result = await carsService.getCars({
        page: 1,
        pageSize: 10,
        searchBy: 'model',
        keyword: 'K5',
      });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should respect pageSize parameter', async () => {
      const result = await carsService.getCars({
        page: 1,
        pageSize: 2,
      });

      expect(result.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('updateCar', () => {
    it('should successfully update car data', async () => {
      const mockCar: CarWithModel = {
        id: 1,
        carNumber: '44라4444',
        manufacturingYear: 2020,
        mileage: 50,
        price: 1000000,
        accidentCount: 0,
        explanation: null,
        accidentDetails: null,
        companyId,
        modelId: 2,
        status: CarStatus.possession,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: null,
        model: mockCarModels[1], // K5
      };

      (global as unknown as GlobalHelpers).addMockCar(mockCar);

      const updateData = {
        carNumber: '55마5555',
        mileage: 100,
        price: 900000,
      };

      const result = await carsService.updateCar({
        carId: 1,
        data: updateData,
      });

      expect(result.id).toBe(1);
      expect(result.carNumber).toBe('55마5555');
      expect(result.mileage).toBe(100);
      expect(result.price).toBe(900000);
    });

    it('should update car model', async () => {
      const mockCar: CarWithModel = {
        id: 1,
        carNumber: '66바6666',
        manufacturingYear: 2020,
        mileage: 0,
        price: 1000000,
        accidentCount: 0,
        explanation: null,
        accidentDetails: null,
        companyId,
        modelId: 2,
        status: CarStatus.possession,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: null,
        model: mockCarModels[1], // K5
      };

      (global as unknown as GlobalHelpers).addMockCar(mockCar);

      const updateData = {
        manufacturer: '현대',
        model: '그랜저',
      };

      const result = await carsService.updateCar({
        carId: 1,
        data: updateData,
      });

      expect(result.id).toBe(1);
      expect(result.manufacturer).toBe('현대');
      expect(result.model).toBe('그랜저');
    });

    it('should throw NotFoundError when car does not exist', async () => {
      await expect(
        carsService.updateCar({
          carId: 99999,
          data: { price: 1000000 },
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError with invalid model', async () => {
      const mockCar: CarWithModel = {
        id: 1,
        carNumber: '77사7777',
        manufacturingYear: 2020,
        mileage: 0,
        price: 1000000,
        accidentCount: 0,
        explanation: null,
        accidentDetails: null,
        companyId,
        modelId: 2,
        status: CarStatus.possession,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: null,
        model: mockCarModels[1], // K5
      };

      (global as unknown as GlobalHelpers).addMockCar(mockCar);

      await expect(
        carsService.updateCar({
          carId: 1,
          data: {
            manufacturer: 'invalid',
            model: 'invalid',
          },
        }),
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('deleteCar', () => {
    it('should successfully delete car', async () => {
      const mockCar: CarWithModel = {
        id: 1,
        carNumber: '88아8888',
        manufacturingYear: 2020,
        mileage: 0,
        price: 1000000,
        accidentCount: 0,
        explanation: null,
        accidentDetails: null,
        companyId,
        modelId: 2,
        status: CarStatus.possession,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: null,
        model: mockCarModels[1], // K5
      };

      (global as unknown as GlobalHelpers).addMockCar(mockCar);

      await expect(carsService.deleteCar({ carId: 1 })).resolves.not.toThrow();

      // Verify car is deleted
      await expect(carsService.getCar({ carId: 1 })).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw NotFoundError when car does not exist', async () => {
      await expect(carsService.deleteCar({ carId: 99999 })).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('getCarModels', () => {
    it('should return all car models grouped by manufacturer', async () => {
      const result = await carsService.getCarModels();

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);

      const manufacturerGroup = result.data[0];
      expect(manufacturerGroup.manufacturer).toBeDefined();
      expect(Array.isArray(manufacturerGroup.model)).toBe(true);
    });

    it('should include all seed data manufacturers', async () => {
      const result = await carsService.getCarModels();

      const manufacturers = result.data.map((group) => group.manufacturer);
      expect(manufacturers).toContain('기아');
      expect(manufacturers).toContain('현대');
      expect(manufacturers).toContain('쉐보레');
    });
  });
});
