import { config } from 'dotenv';
import { resolve } from 'path';
import { beforeAll, afterAll, beforeEach } from 'vitest';
import prisma from '@/middlewares/prisma';

// Load test environment variables
config({ path: resolve(__dirname, '../../.env.test') });

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

afterAll(async () => {
  // Disconnect from test database
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up database before each test
  // Company has CASCADE DELETE, so deleting companies will delete users and related data
  await prisma.company.deleteMany();
});
