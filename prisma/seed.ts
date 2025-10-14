import { PrismaClient, CarType } from '@prisma/client';

// PrismaClient 인스턴스 생성
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  // CarModel 데이터 생성
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
    skipDuplicates: true, // 이미 데이터가 있으면 건너뛰기
  });

  console.log('Seeding finished.');
}

// main 함수를 실행하고, 성공/실패 여부에 따라 프로세스를 종료합니다.
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // 스크립트 실행이 끝나면 PrismaClient 연결 끊기
    await prisma.$disconnect();
  });
