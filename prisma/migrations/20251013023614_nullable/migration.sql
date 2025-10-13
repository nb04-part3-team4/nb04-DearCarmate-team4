/*
  Warnings:

  - Made the column `file_url` on table `contract_document` required. This step will fail if there are existing NULL values in that column.
  - Made the column `file_size` on table `contract_document` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."contract_document" ALTER COLUMN "file_url" SET NOT NULL,
ALTER COLUMN "file_size" SET NOT NULL,
ALTER COLUMN "contract_id" DROP NOT NULL;
