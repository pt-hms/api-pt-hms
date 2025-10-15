/*
  Warnings:

  - Added the required column `ss_order` to the `Ritase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ritase" ADD COLUMN     "ss_order" TEXT NOT NULL;
