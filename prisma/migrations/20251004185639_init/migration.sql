-- CreateTable
CREATE TABLE "Driver" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "no_hp" TEXT NOT NULL,
    "no_pol" TEXT,
    "kategori" TEXT,
    "foto_profil" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "nama_driver" TEXT NOT NULL,
    "no_hp" TEXT NOT NULL,
    "no_pol" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "pickup_point" TEXT NOT NULL,
    "tujuan" TEXT NOT NULL,
    "driverId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_no_hp_key" ON "Driver"("no_hp");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
