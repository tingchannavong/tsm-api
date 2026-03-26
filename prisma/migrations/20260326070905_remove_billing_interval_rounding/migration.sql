/*
  Warnings:

  - You are about to drop the column `billingIntervalMin` on the `Pricing` table. All the data in the column will be lost.
  - You are about to drop the column `roundingMethod` on the `Pricing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Pricing` DROP COLUMN `billingIntervalMin`,
    DROP COLUMN `roundingMethod`;
