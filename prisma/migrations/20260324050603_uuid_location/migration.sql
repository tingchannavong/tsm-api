/*
  Warnings:

  - The primary key for the `Location` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `SessionRecord` DROP FOREIGN KEY `SessionRecord_locationId_fkey`;

-- DropIndex
DROP INDEX `SessionRecord_locationId_fkey` ON `SessionRecord`;

-- AlterTable
ALTER TABLE `Location` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `SessionRecord` MODIFY `locationId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `SessionRecord` ADD CONSTRAINT `SessionRecord_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
