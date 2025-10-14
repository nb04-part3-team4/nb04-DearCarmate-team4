import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCompanies() {
  console.log('🏢 Seeding companies...');

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

  console.log('✅ Companies seeded successfully:', company);
}

// 직접 실행될 때만 실행
if (require.main === module) {
  seedCompanies()
    .catch((e) => {
      console.error('❌ Error seeding companies:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
