import { PrismaClient, CarType } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCarModels() {
  console.log('🚗 Seeding car models...');

  await prisma.carModel.createMany({
    data: [
      // 기아
      { manufacturer: '기아', model: 'K3', type: CarType.SEDAN },
      { manufacturer: '기아', model: 'K5', type: CarType.SEDAN },
      { manufacturer: '기아', model: 'K7', type: CarType.SEDAN },
      { manufacturer: '기아', model: '쏘렌토', type: CarType.SUV },
      { manufacturer: '기아', model: '모닝', type: CarType.COMPACT },
      // 현대
      { manufacturer: '현대', model: '아반떼', type: CarType.SEDAN },
      { manufacturer: '현대', model: '그랜저', type: CarType.SEDAN },
      { manufacturer: '현대', model: '싼타페', type: CarType.SUV },
      // 쉐보레
      { manufacturer: '쉐보레', model: '스파크', type: CarType.COMPACT },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Car models seeded successfully');
}

// 직접 실행될 때만 실행
if (require.main === module) {
  seedCarModels()
    .catch((e) => {
      console.error('❌ Error seeding car models:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
