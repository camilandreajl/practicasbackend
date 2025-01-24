/*
  Warnings:

  - The values [SuperAdmin] on the enum `Enum_RoleName` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `expires` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Enum_RoleName_new" AS ENUM ('Admin', 'Manager', 'User');
ALTER TABLE "Role" ALTER COLUMN "name" TYPE "Enum_RoleName_new" USING ("name"::text::"Enum_RoleName_new");
ALTER TYPE "Enum_RoleName" RENAME TO "Enum_RoleName_old";
ALTER TYPE "Enum_RoleName_new" RENAME TO "Enum_RoleName";
DROP TYPE "Enum_RoleName_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "expires",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastName",
ADD COLUMN     "position" TEXT,
ADD COLUMN     "termsAndConditionsAcceptedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "Account";

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMonitoring" (
    "id" TEXT NOT NULL,
    "usage" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMonitoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CountryToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CountryToUser_AB_unique" ON "_CountryToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CountryToUser_B_index" ON "_CountryToUser"("B");

-- AddForeignKey
ALTER TABLE "UserMonitoring" ADD CONSTRAINT "UserMonitoring_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToUser" ADD CONSTRAINT "_CountryToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToUser" ADD CONSTRAINT "_CountryToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
