/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Film` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user';

-- CreateIndex
CREATE UNIQUE INDEX `Film_slug_key` ON `Film`(`slug`);
