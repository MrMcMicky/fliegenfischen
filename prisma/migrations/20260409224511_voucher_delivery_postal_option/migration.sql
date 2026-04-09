-- CreateEnum
CREATE TYPE "VoucherDeliveryMethod" AS ENUM ('EMAIL', 'POSTAL');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "voucherDeliveryMethod" "VoucherDeliveryMethod",
ADD COLUMN     "voucherShippingCHF" INTEGER,
ADD COLUMN     "voucherValueCHF" INTEGER;
