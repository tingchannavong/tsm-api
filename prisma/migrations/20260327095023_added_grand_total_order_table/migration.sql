/*
  Warnings:

  - You are about to drop the column `total` on the `Order` table. All the data in the column will be lost.
  - Added the required column `grandTotal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netTotal` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Order` DROP COLUMN `total`,
    ADD COLUMN `grandTotal` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `netTotal` DECIMAL(10, 2) NOT NULL;
