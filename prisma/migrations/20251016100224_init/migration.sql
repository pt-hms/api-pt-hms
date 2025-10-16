/*
  Warnings:

  - You are about to drop the column `bukti_tf` on the `SIJ` table. All the data in the column will be lost.
  - Added the required column `tf_id` to the `SIJ` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SIJ" DROP COLUMN "bukti_tf",
ADD COLUMN     "tf_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "SIJ" ADD CONSTRAINT "SIJ_tf_id_fkey" FOREIGN KEY ("tf_id") REFERENCES "TF"("id") ON DELETE CASCADE ON UPDATE CASCADE;
