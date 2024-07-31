-- CreateTable
CREATE TABLE `article_comment_likes` (
    `comment_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`comment_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_comment_replies` (
    `reply_id` CHAR(36) NOT NULL,
    `comment_id` CHAR(36) NOT NULL,
    `parent_id` CHAR(36) NULL,
    `user_id` CHAR(36) NOT NULL,
    `comment` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`reply_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_comment_reply_likes` (
    `reply_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`reply_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `article_comment_likes` ADD CONSTRAINT `article_comment_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `article_comment_likes` ADD CONSTRAINT `article_comment_likes_comment_id_fkey` FOREIGN KEY (`comment_id`) REFERENCES `article_comments`(`comment_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `article_comment_replies` ADD CONSTRAINT `article_comment_replies_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `article_comment_replies` ADD CONSTRAINT `article_comment_replies_comment_id_fkey` FOREIGN KEY (`comment_id`) REFERENCES `article_comments`(`comment_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `article_comment_replies` ADD CONSTRAINT `article_comment_replies_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `article_comment_replies`(`reply_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `article_comment_reply_likes` ADD CONSTRAINT `article_comment_reply_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `article_comment_reply_likes` ADD CONSTRAINT `article_comment_reply_likes_reply_id_fkey` FOREIGN KEY (`reply_id`) REFERENCES `article_comment_replies`(`reply_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
