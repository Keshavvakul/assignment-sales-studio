-- AlterTable
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);
