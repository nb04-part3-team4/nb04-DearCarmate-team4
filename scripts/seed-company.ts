import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 테스트용 회사 생성
  const company = await prisma.company.upsert({
    where: { companyCode: 'TEST001' },
    update: {},
    create: {
      name: '테스트 회사',
      companyCode: 'TEST001',
      address: '서울시 강남구',
      phone: '02-1234-5678',
    },
  });

  console.log('✅ 회사 데이터 생성 완료:', company);
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
