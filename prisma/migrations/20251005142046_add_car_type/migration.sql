/*
  Warnings:

  - Changed the type of `type` on the `car_models` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."CarType" AS ENUM ('COMPACT', 'SEDAN', 'SUV');

-- AlterTable
ALTER TABLE "public"."car_models" DROP COLUMN "type",
ADD COLUMN     "type" "public"."CarType" NOT NULL;
