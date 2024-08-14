/*
  Warnings:

  - You are about to alter the column `open_time` on the `operating_days_and_hours` table. The data in that column could be lost. The data in that column will be cast from `VarChar(5)` to `DateTime`.
  - You are about to alter the column `close_time` on the `operating_days_and_hours` table. The data in that column could be lost. The data in that column will be cast from `VarChar(5)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `operating_days_and_hours` MODIFY `open_time` DATETIME NOT NULL,
    MODIFY `close_time` DATETIME NOT NULL;

-- CreateTable
CREATE TABLE `event_categories` (
    `category_id` CHAR(36) NOT NULL,
    `category_name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `event_id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `price_start` INTEGER NOT NULL,
    `price_end` INTEGER NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `rating` FLOAT NOT NULL,
    `status` ENUM('PENDING', 'REVISION', 'REJECT', 'APPROVE') NOT NULL DEFAULT 'PENDING',
    `category_id` CHAR(36) NOT NULL,
    `description` TEXT NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`event_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_operating_days_and_hours` (
    `operating_id` CHAR(36) NOT NULL,
    `event_id` CHAR(36) NOT NULL,
    `date` DATE NOT NULL,
    `open_time` DATETIME NOT NULL,
    `close_time` DATETIME NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`operating_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_EventFiles` (
    `A` CHAR(36) NOT NULL,
    `B` CHAR(36) NOT NULL,

    UNIQUE INDEX `_EventFiles_AB_unique`(`A`, `B`),
    INDEX `_EventFiles_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `event_categories`(`category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `event_operating_days_and_hours` ADD CONSTRAINT `event_operating_days_and_hours_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `_EventFiles` ADD CONSTRAINT `_EventFiles_A_fkey` FOREIGN KEY (`A`) REFERENCES `events`(`event_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EventFiles` ADD CONSTRAINT `_EventFiles_B_fkey` FOREIGN KEY (`B`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
