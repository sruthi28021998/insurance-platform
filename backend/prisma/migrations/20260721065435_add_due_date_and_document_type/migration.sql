-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('IDENTITY', 'POLICY', 'CLAIM', 'OTHER');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "documentType" "DocumentType" NOT NULL DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "PremiumPayment" ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
