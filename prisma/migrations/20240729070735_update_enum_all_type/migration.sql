/*
  Warnings:

  - You are about to alter the column `status` on the `articles` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(1))`.
  - You are about to alter the column `visibility` on the `files` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(2))`.
  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(0))`.

*/

-- AlterTable
ALTER TABLE `files` MODIFY `visibility` ENUM('PRIVATE', 'PUBLIC') NOT NULL DEFAULT 'PRIVATE';

-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER';
