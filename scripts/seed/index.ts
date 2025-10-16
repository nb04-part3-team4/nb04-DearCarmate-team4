import { PrismaClient } from '@prisma/client';
import { seedCarModels } from './car-models.seed';
import { seedCompanies } from './companies.seed';
import { seedAdmin } from './admin.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    await seedCarModels();
    await seedCompanies();
    await seedAdmin();

    console.log('\n✅ All seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
