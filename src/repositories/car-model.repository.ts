import prisma from '@/utils/prisma.js';
import { CarModel } from '@prisma/client';

class CarModelRepository {
  async findUnique(options: {
    manufacturer: string;
    model: string;
  }): Promise<CarModel | null> {
    return await prisma.carModel.findUnique({
      where: { manufacturer_model: options },
    });
  }
  async findMany(): Promise<CarModel[]> {
    return await prisma.carModel.findMany({
      orderBy: {
        manufacturer: 'asc',
      },
    });
  }
}

export default new CarModelRepository();
