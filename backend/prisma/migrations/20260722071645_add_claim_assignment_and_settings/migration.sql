-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "assignedAgentId" INTEGER;

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "companyName" TEXT NOT NULL DEFAULT 'Insurance Management Platform',
    "claimApprovalThreshold" DOUBLE PRECISION NOT NULL DEFAULT 50000,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
