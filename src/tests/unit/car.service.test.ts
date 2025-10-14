import carsService from '@/services/cars.service.js';
import { BadRequestError } from '@/utils/custom-error.js';
import { describe, it, expect, beforeEach } from 'vitest';

// mock data 처리
import carModelRepository from '@/repositories/car-model.repository.js';
import carRepository from '@/repositories/cars.repository.js';
import { CarType } from '@prisma/client';
import { userService } from '@/services/user.service.js';
vi.mock('@/services/user.service.js');
vi.mock('@/repositories/car-model.repository.js');
vi.mock('@/repositories/cars.repository.js');

describe('CarService', () => {
  beforeEach(async () => {
    const mockCompanyId = 10;
    const mockSeedData = [
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
    vi.mocked(userService.getMe).mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      employeeNumber: 'EMP001',
      isAdmin: false,
      company: {
        companyCode: 'TEST_CODE',
      },
      phoneNumber: '010-1234-5678',
    });
    vi.mocked(carModelRepository.findUnique).mockImplementation(
      async ({ manufacturer, model }) => {
        // mockSeedData 배열에서 manufacturer와 model이 일치하는 요소 찾기
        const foundModel = mockSeedData.find(
          (m) => m.manufacturer === manufacturer && m.model === model,
        );
        // 찾았으면 해당 객체를 반환하고, 못 찾았으면 undefined를 반환
        return Promise.resolve(foundModel || null);
      },
    );
    vi.mocked(carRepository.create).mockImplementation(
      async ({ data: createData }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { company, model, ...scalarData } = createData;
        if (!model?.connect?.id) {
          // 테스트 데이터 세팅 오류
          throw new BadRequestError(
            'Mock Error: createData에 model.connect.id가 없습니다.',
          );
        }
        // 1. 서비스가 전달한 modelId를 가져오기
        const connectedModelId = model.connect.id;
        // 2. 그 ID를 사용해 가상 시드 데이터에서 올바른 모델 정보를 찾아옴
        const connectedModel = mockSeedData.find(
          (m) => m.id === connectedModelId,
        );
        if (!connectedModel) {
          throw new BadRequestError(
            `Mock Error: Cannot find model with id ${connectedModelId}`,
          );
        }
        return {
          id: Math.floor(Math.random() * 1000), // DB가 만들어주는 임의의 ID

          // 사용자 입력
          carNumber: scalarData.carNumber,
          manufacturingYear: scalarData.manufacturingYear,
          price: scalarData.price,
          mileage: scalarData.mileage ?? 0,
          accidentCount: scalarData.accidentCount ?? 0,
          explanation: scalarData.explanation ?? null,
          accidentDetails: scalarData.accidentDetails ?? null,

          // DB가 connect를 통해 채워주는 외래 키(FK)
          companyId: mockCompanyId,
          modelId: connectedModel.id,

          // DB가 자동으로 채워주는 기본값들
          status: 'possession',
          createdAt: new Date(),
          updatedAt: new Date(),
          imageUrl: null,
          model: connectedModel,
        };
      },
    );
  });

  describe('createCar', () => {
    // 성공 테스트
    it('shoud create a new car', async () => {
      const userId = 1;
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
    // 실패 테스트
    it('should throw BadRequestError with invalid model', async () => {
      const userId = 1;
      const carData = {
        carNumber: '12가1234',
        manufacturer: 'invalid',
        model: 'invalid',
        manufacturingYear: 2020,
        mileage: 30,
        price: 1000000,
        accidentCount: 1,
        explanation: '테스트 사고',
        accidentDetails: '테스트 차량 사고 내용입니다',
      };

      await expect(
        carsService.createCar({ userId, data: carData }),
      ).rejects.toThrow(BadRequestError);
    });
  });

  //   describe('getCar', () => {
  //     it('should get car data', async () => {});
  //   });
});
