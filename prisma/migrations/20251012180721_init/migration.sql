/*
  Warnings:

  - You are about to drop the `Driver` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_driverId_fkey";

-- DropTable
DROP TABLE "public"."Driver";

-- DropTable
DROP TABLE "public"."Order";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "foto_profil" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "no_pol" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "mobil" TEXT NOT NULL,
    "no_kep" TEXT NOT NULL,
    "exp_kep" DATE NOT NULL,
    "no_hp" TEXT NOT NULL,
    "no_darutat" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SIJ" (
    "id" SERIAL NOT NULL,
    "no_sij" INTEGER NOT NULL,
    "bukti_tf" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SIJ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ritase" (
    "id" SERIAL NOT NULL,
    "pickup_point" TEXT NOT NULL,
    "tujuan" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ritase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_no_pol_key" ON "User"("no_pol");

-- CreateIndex
CREATE UNIQUE INDEX "User_no_hp_key" ON "User"("no_hp");

-- AddForeignKey
ALTER TABLE "SIJ" ADD CONSTRAINT "SIJ_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ritase" ADD CONSTRAINT "Ritase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
