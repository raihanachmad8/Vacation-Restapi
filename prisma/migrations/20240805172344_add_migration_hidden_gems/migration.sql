-- AlterTable
ALTER TABLE `files` ADD COLUMN `hiddenGemsHidden_gem_id` CHAR(36) NULL;

-- CreateTable
CREATE TABLE `hidden_gems_categories` (
    `category_id` CHAR(36) NOT NULL,
    `category_name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hidden_gems` (
    `hidden_gem_id` CHAR(36) NOT NULL,
    `operation_id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `price_start` INTEGER NOT NULL,
    `price_end` INTEGER NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `rating` FLOAT NOT NULL,
    `category_id` CHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'REVISION', 'REJECT', 'APPROVE') NOT NULL DEFAULT 'PENDING',
    `description` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`hidden_gem_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `operating_days_and_hours` (
    `operating_id` CHAR(36) NOT NULL,
    `hidden_gem_id` CHAR(36) NOT NULL,
    `day` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    `open_time` VARCHAR(5) NOT NULL,
    `close_time` VARCHAR(5) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `operating_days_and_hours_hidden_gem_id_day_key`(`hidden_gem_id`, `day`),
    PRIMARY KEY (`operating_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_HiddenGemsFiles` (
    `A` CHAR(36) NOT NULL,
    `B` CHAR(36) NOT NULL,

    UNIQUE INDEX `_HiddenGemsFiles_AB_unique`(`A`, `B`),
    INDEX `_HiddenGemsFiles_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hidden_gems` ADD CONSTRAINT `hidden_gems_operation_id_fkey` FOREIGN KEY (`operation_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hidden_gems` ADD CONSTRAINT `hidden_gems_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `hidden_gems_categories`(`category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `operating_days_and_hours` ADD CONSTRAINT `operating_days_and_hours_hidden_gem_id_fkey` FOREIGN KEY (`hidden_gem_id`) REFERENCES `hidden_gems`(`hidden_gem_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `_HiddenGemsFiles` ADD CONSTRAINT `_HiddenGemsFiles_A_fkey` FOREIGN KEY (`A`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_HiddenGemsFiles` ADD CONSTRAINT `_HiddenGemsFiles_B_fkey` FOREIGN KEY (`B`) REFERENCES `hidden_gems`(`hidden_gem_id`) ON DELETE CASCADE ON UPDATE CASCADE;
