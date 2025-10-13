/*
  Warnings:

  - Added the required column `contract_id` to the `contract_document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."contract_document" ADD COLUMN     "contract_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."contract_document" ADD CONSTRAINT "contract_document_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
