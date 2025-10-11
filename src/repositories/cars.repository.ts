import prisma from '@/utils/prisma.js';
import {
  CarId,
  CarWithModel,
  CreateCarInput,
  GetListInput,
  UpdateCarInput,
} from '@/types/cars.type.js';
import { Prisma } from '@prisma/client';

class CarRepository {
  async findById({ carId }: CarId): Promise<CarWithModel | null> {
    return await prisma.car.findUnique({
      where: { id: carId },
      include: {
        model: true,
      },
    });
  }
  async findMany({ skip, take, where }: GetListInput): Promise<CarWithModel[]> {
    return await prisma.car.findMany({
      where,
      skip,
      take,
      include: {
        model: true,
      },
    });
  }
  async create({ data }: CreateCarInput): Promise<CarWithModel> {
    return await prisma.car.create({
      data,
      include: {
        model: true,
      },
    });
  }
  async createMany(
    data: Prisma.CarCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return await prisma.car.createMany({
      data,
      skipDuplicates: false,
    });
  }
  async update({ carId, data }: UpdateCarInput): Promise<CarWithModel> {
    return await prisma.car.update({
      where: {
        id: carId,
      },
      data,
      include: {
        model: true,
      },
    });
  }
  async delete({ carId }: CarId): Promise<CarWithModel> {
    return await prisma.car.delete({
      where: {
        id: carId,
      },
      include: {
        model: true,
      },
    });
  }
  async count(where: Prisma.CarWhereInput): Promise<number> {
    return await prisma.car.count({
      where,
    });
  }
}

export default new CarRepository();
