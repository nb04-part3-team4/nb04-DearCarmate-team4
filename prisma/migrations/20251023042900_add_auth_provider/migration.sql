-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "auth_provider" TEXT NOT NULL DEFAULT 'local';
