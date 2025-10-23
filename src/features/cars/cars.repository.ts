import prisma from '@/shared/middlewares/prisma.js';
import {
  CarId,
  CarWithModel,
  CreateCarInput,
  GetListInput,
  UpdateCarInput,
} from '@/features/cars/cars.type.js';
import { Prisma, CarStatus } from '@prisma/client';

type UpdateCarStatusData = {
  status: CarStatus;
};

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
  async findAllCarsForContract() {
    return await prisma.car.findMany({
      select: {
        id: true,
        carNumber: true,
        model: {
          select: {
            model: true,
          },
        },
      },
    });
  }
  async updateInTx(
    tx: Prisma.TransactionClient,
    carId: number,
    data: UpdateCarInput['data'] | UpdateCarStatusData,
  ): Promise<void> {
    await tx.car.update({
      where: {
        id: carId,
      },
      data,
    });
  }
}
export default new CarRepository();
