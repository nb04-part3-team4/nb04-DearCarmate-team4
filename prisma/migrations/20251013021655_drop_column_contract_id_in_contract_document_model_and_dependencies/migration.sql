/*
  Warnings:

  - You are about to drop the `contract_documents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."contract_documents" DROP CONSTRAINT "contract_documents_contract_id_fkey";

-- DropTable
DROP TABLE "public"."contract_documents";

-- CreateTable
CREATE TABLE "public"."contract_document" (
    "id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT,
    "file_size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_document_pkey" PRIMARY KEY ("id")
);
