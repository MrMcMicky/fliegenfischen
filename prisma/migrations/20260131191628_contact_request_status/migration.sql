/*
  Warnings:

  - Added the required column `updatedAt` to the `ContactRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContactRequestStatus" AS ENUM ('OPEN', 'DONE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "ContactRequest" ADD COLUMN     "status" "ContactRequestStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
