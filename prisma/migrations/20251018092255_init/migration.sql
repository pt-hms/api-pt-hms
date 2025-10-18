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
    "no_darurat" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SIJ" (
    "id" SERIAL NOT NULL,
    "no_sij" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tf_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SIJ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TF" (
    "id" SERIAL NOT NULL,
    "bukti_tf" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ritase" (
    "id" SERIAL NOT NULL,
    "ss_order" TEXT NOT NULL,
    "argo" TEXT NOT NULL,
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
CREATE INDEX "Ritase_user_id_pickup_point_tujuan_idx" ON "Ritase"("user_id", "pickup_point", "tujuan");

-- AddForeignKey
ALTER TABLE "SIJ" ADD CONSTRAINT "SIJ_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SIJ" ADD CONSTRAINT "SIJ_tf_id_fkey" FOREIGN KEY ("tf_id") REFERENCES "TF"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TF" ADD CONSTRAINT "TF_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ritase" ADD CONSTRAINT "Ritase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
