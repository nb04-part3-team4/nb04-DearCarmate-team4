import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

export async function seedAdmin() {
  console.log('👤 Seeding admin user...');

  // Find the test company
  const company = await prisma.company.findUnique({
    where: { companyCode: 'TEST001' },
  });

  if (!company) {
    console.error('❌ Company TEST001 not found');
    return;
  }

  // Create admin user
  const hashedPassword = await argon2.hash('admin1234');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      isAdmin: true,
      password: hashedPassword, // 비밀번호도 업데이트
    },
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: '관리자',
      employeeNumber: 'ADMIN001',
      phoneNumber: '010-0000-0000',
      isAdmin: true,
      companyId: company.id,
    },
  });

  console.log('✅ Admin user seeded successfully:', {
    email: admin.email,
    isAdmin: admin.isAdmin,
  });
}

// 직접 실행될 때만 실행
if (require.main === module) {
  seedAdmin()
    .catch((e) => {
      console.error('❌ Error seeding admin:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
