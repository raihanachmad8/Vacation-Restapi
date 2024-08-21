/*
  Warnings:

  - You are about to alter the column `open_time` on the `event_operating_days_and_hours` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `close_time` on the `event_operating_days_and_hours` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `rating` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `hidden_gems` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `hidden_gems_comments` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `hidden_gems_replies` table. All the data in the column will be lost.
  - You are about to alter the column `open_time` on the `operating_days_and_hours` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `close_time` on the `operating_days_and_hours` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `event_operating_days_and_hours` MODIFY `open_time` DATETIME NOT NULL,
    MODIFY `close_time` DATETIME NULL;

-- AlterTable
ALTER TABLE `events` DROP COLUMN `rating`;

-- AlterTable
ALTER TABLE `hidden_gems` DROP COLUMN `rating`;

-- AlterTable
ALTER TABLE `hidden_gems_comments` DROP COLUMN `rating`;

-- AlterTable
ALTER TABLE `hidden_gems_replies` DROP COLUMN `rating`;

-- AlterTable
ALTER TABLE `operating_days_and_hours` MODIFY `open_time` DATETIME NOT NULL,
    MODIFY `close_time` DATETIME NOT NULL;

-- CreateTable
CREATE TABLE `hidden_gems_ratings` (
    `hidden_gem_id` CHAR(36) NOT NULL,
    `comment_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `rating` FLOAT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hidden_gems_ratings_hidden_gem_id_comment_id_user_id_key`(`hidden_gem_id`, `comment_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_interests` (
    `event_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`event_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hidden_gems_ratings` ADD CONSTRAINT `hidden_gems_ratings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hidden_gems_ratings` ADD CONSTRAINT `hidden_gems_ratings_hidden_gem_id_fkey` FOREIGN KEY (`hidden_gem_id`) REFERENCES `hidden_gems`(`hidden_gem_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hidden_gems_ratings` ADD CONSTRAINT `hidden_gems_ratings_comment_id_fkey` FOREIGN KEY (`comment_id`) REFERENCES `hidden_gems_comments`(`comment_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `event_interests` ADD CONSTRAINT `event_interests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `event_interests` ADD CONSTRAINT `event_interests_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
