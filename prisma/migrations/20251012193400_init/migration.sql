/*
  Warnings:

  - You are about to drop the column `no_darutat` on the `User` table. All the data in the column will be lost.
  - Added the required column `no_darurat` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "no_darutat",
ADD COLUMN     "no_darurat" TEXT NOT NULL;
