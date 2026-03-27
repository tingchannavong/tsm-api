/*
  Warnings:

  - You are about to drop the column `priceAtBilling` on the `OrderDetail` table. All the data in the column will be lost.
  - You are about to drop the column `pricingId` on the `OrderDetail` table. All the data in the column will be lost.
  - You are about to drop the column `unitAtBilling` on the `OrderDetail` table. All the data in the column will be lost.
  - Added the required column `unit` to the `OrderDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `OrderDetail` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `OrderDetail` DROP FOREIGN KEY `OrderDetail_pricingId_fkey`;

-- DropIndex
DROP INDEX `OrderDetail_pricingId_fkey` ON `OrderDetail`;

-- AlterTable
ALTER TABLE `OrderDetail` DROP COLUMN `priceAtBilling`,
    DROP COLUMN `pricingId`,
    DROP COLUMN `unitAtBilling`,
    ADD COLUMN `unit` VARCHAR(191) NOT NULL,
    ADD COLUMN `unitPrice` DECIMAL(10, 2) NOT NULL;
