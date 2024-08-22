
-- CreateTable
CREATE TABLE `kanban_boards` (
    `board_id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`board_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kanban_teams` (
    `team_id` CHAR(36) NOT NULL,
    `board_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `role` ENUM('OWNER', 'ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `permission` ENUM('EDIT', 'COMMENT', 'VIEW') NOT NULL DEFAULT 'VIEW',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`team_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kanban_cards` (
    `card_id` CHAR(36) NOT NULL,
    `board_id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('TODO', 'DOING', 'DONE') NOT NULL DEFAULT 'TODO',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'LOW',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`card_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kanban_task_lists` (
    `task_list_id` CHAR(36) NOT NULL,
    `card_id` CHAR(36) NOT NULL,
    `task` TEXT NOT NULL,
    `is_done` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`task_list_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kanban_members` (
    `member_id` CHAR(36) NOT NULL,
    `card_id` CHAR(36) NOT NULL,
    `team_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`member_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kanban_public_access` (
    `access_id` CHAR(36) NOT NULL,
    `board_id` CHAR(36) NOT NULL,
    `code` VARCHAR(255) NOT NULL,
    `permission` ENUM('EDIT', 'COMMENT', 'VIEW') NOT NULL DEFAULT 'VIEW',
    `hashed` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`access_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `kanban_boards` ADD CONSTRAINT `kanban_boards_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `kanban_teams` ADD CONSTRAINT `kanban_teams_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `kanban_teams` ADD CONSTRAINT `kanban_teams_board_id_fkey` FOREIGN KEY (`board_id`) REFERENCES `kanban_boards`(`board_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `kanban_cards` ADD CONSTRAINT `kanban_cards_board_id_fkey` FOREIGN KEY (`board_id`) REFERENCES `kanban_boards`(`board_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `kanban_task_lists` ADD CONSTRAINT `kanban_task_lists_card_id_fkey` FOREIGN KEY (`card_id`) REFERENCES `kanban_cards`(`card_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `kanban_members` ADD CONSTRAINT `kanban_members_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `kanban_teams`(`team_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `kanban_members` ADD CONSTRAINT `kanban_members_card_id_fkey` FOREIGN KEY (`card_id`) REFERENCES `kanban_cards`(`card_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `kanban_public_access` ADD CONSTRAINT `kanban_public_access_board_id_fkey` FOREIGN KEY (`board_id`) REFERENCES `kanban_boards`(`board_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
