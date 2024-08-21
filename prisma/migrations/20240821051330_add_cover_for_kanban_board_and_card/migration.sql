/*
  Warnings:

  - You are about to alter the column `open_time` on the `event_operating_days_and_hours` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `close_time` on the `event_operating_days_and_hours` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `open_time` on the `operating_days_and_hours` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `close_time` on the `operating_days_and_hours` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `event_operating_days_and_hours` MODIFY `open_time` DATETIME NOT NULL,
    MODIFY `close_time` DATETIME NULL;

-- AlterTable
ALTER TABLE `kanban_boards` ADD COLUMN `cover_id` CHAR(36) NULL;

-- AlterTable
ALTER TABLE `kanban_cards` ADD COLUMN `cover_id` CHAR(36) NULL;

-- AlterTable
ALTER TABLE `operating_days_and_hours` MODIFY `open_time` DATETIME NOT NULL,
    MODIFY `close_time` DATETIME NOT NULL;

-- AddForeignKey
ALTER TABLE `kanban_boards` ADD CONSTRAINT `kanban_boards_cover_id_fkey` FOREIGN KEY (`cover_id`) REFERENCES `files`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `kanban_cards` ADD CONSTRAINT `kanban_cards_cover_id_fkey` FOREIGN KEY (`cover_id`) REFERENCES `files`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
