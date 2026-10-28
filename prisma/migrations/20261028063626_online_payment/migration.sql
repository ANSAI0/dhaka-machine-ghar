-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'paid', 'failed');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paidAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "payMethod" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'unpaid',
ADD COLUMN     "tranId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_tranId_key" ON "Order"("tranId");

