/*
  Warnings:

  - The `status` column on the `Coupon` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CouponStatus" AS ENUM ('available', 'used');

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "status",
ADD COLUMN     "status" "CouponStatus" NOT NULL DEFAULT 'available';
