/*
  Warnings:

  - Added the required column `currencyCode` to the `OrderDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `OrderDetail` ADD COLUMN `basePrice` DECIMAL(10, 2) NULL,
    ADD COLUMN `currencyCode` CHAR(3) NOT NULL,
    ADD COLUMN `durationMin` INTEGER NULL,
    MODIFY `unit` VARCHAR(191) NULL;
