import prisma from '@/utils/prisma';
import { Car } from '@prisma/client';

export class CarRepository {
  async findById(id: number): Promise<Car | null> {
    return await prisma.car.findUnique({
      where: { id },
    });
  }
}

export const carRepository = new CarRepository();
