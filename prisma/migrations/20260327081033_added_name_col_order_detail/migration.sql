/*
  Warnings:

  - Added the required column `displayName` to the `OrderDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `OrderDetail` ADD COLUMN `displayName` VARCHAR(191) NOT NULL;
