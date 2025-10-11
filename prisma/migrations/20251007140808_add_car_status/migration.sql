/*
  Warnings:

  - The `status` column on the `cars` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."CarStatus" AS ENUM ('possession', 'contractProceeding', 'contractCompleted');

-- AlterTable
ALTER TABLE "public"."cars" DROP COLUMN "status",
ADD COLUMN     "status" "public"."CarStatus" NOT NULL DEFAULT 'possession';
