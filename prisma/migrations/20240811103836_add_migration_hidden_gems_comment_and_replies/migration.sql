/*
  Warnings:

  - You are about to drop the column `hiddenGemsHidden_gem_id` on the `files` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `files` DROP COLUMN `hiddenGemsHidden_gem_id`;

-- CreateTable
CREATE TABLE `hidden_gems_comments` (
    `comment_id` CHAR(36) NOT NULL,
    `hidden_gem_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `rating` FLOAT NOT NULL,
    `comment` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`comment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hidden_gems_replies` (
    `reply_id` CHAR(36) NOT NULL,
    `comment_id` CHAR(36) NOT NULL,
    `parent_id` CHAR(36) NULL,
    `user_id` CHAR(36) NOT NULL,
    `rating` FLOAT NOT NULL,
    `comment` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`reply_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hidden_gems_comments` ADD CONSTRAINT `hidden_gems_comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hidden_gems_comments` ADD CONSTRAINT `hidden_gems_comments_hidden_gem_id_fkey` FOREIGN KEY (`hidden_gem_id`) REFERENCES `hidden_gems`(`hidden_gem_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hidden_gems_replies` ADD CONSTRAINT `hidden_gems_replies_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hidden_gems_replies` ADD CONSTRAINT `hidden_gems_replies_comment_id_fkey` FOREIGN KEY (`comment_id`) REFERENCES `hidden_gems_comments`(`comment_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hidden_gems_replies` ADD CONSTRAINT `hidden_gems_replies_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `hidden_gems_replies`(`reply_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
