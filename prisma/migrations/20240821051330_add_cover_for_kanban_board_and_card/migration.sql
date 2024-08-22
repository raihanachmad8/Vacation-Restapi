

-- AlterTable
ALTER TABLE `kanban_boards` ADD COLUMN `cover_id` CHAR(36) NULL;

-- AlterTable
ALTER TABLE `kanban_cards` ADD COLUMN `cover_id` CHAR(36) NULL;

-- AddForeignKey
ALTER TABLE `kanban_boards` ADD CONSTRAINT `kanban_boards_cover_id_fkey` FOREIGN KEY (`cover_id`) REFERENCES `files`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `kanban_cards` ADD CONSTRAINT `kanban_cards_cover_id_fkey` FOREIGN KEY (`cover_id`) REFERENCES `files`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
