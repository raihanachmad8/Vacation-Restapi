/*
  Warnings:

  - You are about to drop the `_ArticleToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_ArticleToTag` DROP FOREIGN KEY `_ArticleToTag_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ArticleToTag` DROP FOREIGN KEY `_ArticleToTag_B_fkey`;

-- AlterTable
ALTER TABLE `articles` ADD COLUMN `status` ENUM('Pending', 'Revision', 'Reject', 'Approve') NOT NULL DEFAULT 'Pending';

-- DropTable
DROP TABLE `_ArticleToTag`;

-- CreateTable
CREATE TABLE `_ArticleTag` (
    `A` CHAR(36) NOT NULL,
    `B` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `_ArticleTag_AB_unique`(`A`, `B`),
    INDEX `_ArticleTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ArticleTag` ADD CONSTRAINT `_ArticleTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `articles`(`article_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ArticleTag` ADD CONSTRAINT `_ArticleTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `tags`(`tag_name`) ON DELETE CASCADE ON UPDATE CASCADE;
