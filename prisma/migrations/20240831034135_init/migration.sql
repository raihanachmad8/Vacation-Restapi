-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "FileVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'REVISION', 'REJECT', 'APPROVE');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "KanbanStatus" AS ENUM ('TODO', 'DOING', 'DONE');

-- CreateEnum
CREATE TYPE "KanbanPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AccessType" AS ENUM ('EDIT', 'COMMENT', 'VIEW');

-- CreateEnum
CREATE TYPE "KanbanRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "users" (
    "user_id" CHAR(36) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "fullname" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "salt" VARCHAR(50) NOT NULL,
    "profile" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "access_token" VARCHAR(400) NOT NULL,
    "refresh_token" VARCHAR(255) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "expires_access_token" TIMESTAMP(3) NOT NULL,
    "expires_refresh_token" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "tag_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("tag_name")
);

-- CreateTable
CREATE TABLE "articles" (
    "article_id" CHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "cover_id" CHAR(36),
    "user_id" CHAR(36) NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "count_view" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("article_id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" CHAR(36) NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "visibility" "FileVisibility" NOT NULL DEFAULT 'PRIVATE',
    "user_id" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_bookmarks" (
    "article_id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_bookmarks_pkey" PRIMARY KEY ("article_id","user_id")
);

-- CreateTable
CREATE TABLE "article_likes" (
    "article_id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_likes_pkey" PRIMARY KEY ("article_id","user_id")
);

-- CreateTable
CREATE TABLE "article_comments" (
    "comment_id" CHAR(36) NOT NULL,
    "article_id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_comments_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "article_comment_likes" (
    "comment_id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_comment_likes_pkey" PRIMARY KEY ("comment_id","user_id")
);

-- CreateTable
CREATE TABLE "article_comment_replies" (
    "reply_id" CHAR(36) NOT NULL,
    "comment_id" CHAR(36) NOT NULL,
    "parent_id" CHAR(36),
    "user_id" CHAR(36) NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_comment_replies_pkey" PRIMARY KEY ("reply_id")
);

-- CreateTable
CREATE TABLE "article_comment_reply_likes" (
    "reply_id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_comment_reply_likes_pkey" PRIMARY KEY ("reply_id","user_id")
);

-- CreateTable
CREATE TABLE "hidden_gems_categories" (
    "category_id" CHAR(36) NOT NULL,
    "category_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hidden_gems_categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "hidden_gems" (
    "hidden_gem_id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "price_start" INTEGER NOT NULL,
    "price_end" INTEGER NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "category_id" CHAR(36) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hidden_gems_pkey" PRIMARY KEY ("hidden_gem_id")
);

-- CreateTable
CREATE TABLE "hidden_gems_ratings" (
    "hidden_gem_id" CHAR(36) NOT NULL,
    "comment_id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hidden_gems_ratings_pkey" PRIMARY KEY ("hidden_gem_id","user_id")
);

-- CreateTable
CREATE TABLE "operating_days_and_hours" (
    "operating_id" CHAR(36) NOT NULL,
    "hidden_gem_id" CHAR(36) NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "open_time" TIMESTAMP(3) NOT NULL,
    "close_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operating_days_and_hours_pkey" PRIMARY KEY ("operating_id")
);

-- CreateTable
CREATE TABLE "hidden_gems_comments" (
    "comment_id" CHAR(36) NOT NULL,
    "hidden_gem_id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hidden_gems_comments_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "hidden_gems_replies" (
    "reply_id" CHAR(36) NOT NULL,
    "comment_id" CHAR(36) NOT NULL,
    "parent_id" CHAR(36),
    "user_id" CHAR(36) NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hidden_gems_replies_pkey" PRIMARY KEY ("reply_id")
);

-- CreateTable
CREATE TABLE "event_categories" (
    "category_id" CHAR(36) NOT NULL,
    "category_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "events" (
    "event_id" CHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "price_start" INTEGER NOT NULL,
    "price_end" INTEGER NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "category_id" CHAR(36) NOT NULL,
    "description" TEXT NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "event_interests" (
    "event_id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_interests_pkey" PRIMARY KEY ("event_id","user_id")
);

-- CreateTable
CREATE TABLE "event_operating_days_and_hours" (
    "operating_id" CHAR(36) NOT NULL,
    "event_id" CHAR(36) NOT NULL,
    "date" DATE NOT NULL,
    "open_time" TIMESTAMP(3) NOT NULL,
    "close_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_operating_days_and_hours_pkey" PRIMARY KEY ("operating_id")
);

-- CreateTable
CREATE TABLE "kanban_boards" (
    "board_id" CHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "cover_id" CHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_boards_pkey" PRIMARY KEY ("board_id")
);

-- CreateTable
CREATE TABLE "kanban_teams" (
    "team_id" CHAR(36) NOT NULL,
    "board_id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "role" "KanbanRole" NOT NULL DEFAULT 'MEMBER',
    "permission" "AccessType" NOT NULL DEFAULT 'VIEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_teams_pkey" PRIMARY KEY ("team_id")
);

-- CreateTable
CREATE TABLE "kanban_cards" (
    "card_id" CHAR(36) NOT NULL,
    "board_id" CHAR(36) NOT NULL,
    "cover_id" CHAR(36),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "KanbanStatus" NOT NULL DEFAULT 'TODO',
    "priority" "KanbanPriority" NOT NULL DEFAULT 'LOW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_cards_pkey" PRIMARY KEY ("card_id")
);

-- CreateTable
CREATE TABLE "kanban_task_lists" (
    "task_list_id" CHAR(36) NOT NULL,
    "card_id" CHAR(36) NOT NULL,
    "task" TEXT NOT NULL,
    "is_done" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_task_lists_pkey" PRIMARY KEY ("task_list_id")
);

-- CreateTable
CREATE TABLE "kanban_members" (
    "member_id" CHAR(36) NOT NULL,
    "card_id" CHAR(36) NOT NULL,
    "team_id" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_members_pkey" PRIMARY KEY ("member_id")
);

-- CreateTable
CREATE TABLE "kanban_public_access" (
    "access_id" CHAR(36) NOT NULL,
    "board_id" CHAR(36) NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "permission" "AccessType" NOT NULL DEFAULT 'VIEW',
    "hashed" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_public_access_pkey" PRIMARY KEY ("access_id")
);

-- CreateTable
CREATE TABLE "_ArticleTag" (
    "A" CHAR(36) NOT NULL,
    "B" VARCHAR(255) NOT NULL
);

-- CreateTable
CREATE TABLE "_HiddenGemsFiles" (
    "A" CHAR(36) NOT NULL,
    "B" CHAR(36) NOT NULL
);

-- CreateTable
CREATE TABLE "_EventFiles" (
    "A" CHAR(36) NOT NULL,
    "B" CHAR(36) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_access_token_key" ON "refresh_tokens"("access_token");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_refresh_token_key" ON "refresh_tokens"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "operating_days_and_hours_hidden_gem_id_day_key" ON "operating_days_and_hours"("hidden_gem_id", "day");

-- CreateIndex
CREATE UNIQUE INDEX "hidden_gems_comments_hidden_gem_id_user_id_key" ON "hidden_gems_comments"("hidden_gem_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "kanban_teams_board_id_user_id_key" ON "kanban_teams"("board_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "_ArticleTag_AB_unique" ON "_ArticleTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ArticleTag_B_index" ON "_ArticleTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_HiddenGemsFiles_AB_unique" ON "_HiddenGemsFiles"("A", "B");

-- CreateIndex
CREATE INDEX "_HiddenGemsFiles_B_index" ON "_HiddenGemsFiles"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EventFiles_AB_unique" ON "_EventFiles"("A", "B");

-- CreateIndex
CREATE INDEX "_EventFiles_B_index" ON "_EventFiles"("B");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_id_fkey" FOREIGN KEY ("cover_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "article_bookmarks" ADD CONSTRAINT "article_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "article_bookmarks" ADD CONSTRAINT "article_bookmarks_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("article_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "article_likes" ADD CONSTRAINT "article_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "article_likes" ADD CONSTRAINT "article_likes_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("article_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("article_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "article_comment_likes" ADD CONSTRAINT "article_comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "article_comment_likes" ADD CONSTRAINT "article_comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "article_comments"("comment_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "article_comment_replies" ADD CONSTRAINT "article_comment_replies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "article_comment_replies" ADD CONSTRAINT "article_comment_replies_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "article_comments"("comment_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "article_comment_replies" ADD CONSTRAINT "article_comment_replies_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "article_comment_replies"("reply_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "article_comment_reply_likes" ADD CONSTRAINT "article_comment_reply_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "article_comment_reply_likes" ADD CONSTRAINT "article_comment_reply_likes_reply_id_fkey" FOREIGN KEY ("reply_id") REFERENCES "article_comment_replies"("reply_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hidden_gems" ADD CONSTRAINT "hidden_gems_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hidden_gems" ADD CONSTRAINT "hidden_gems_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "hidden_gems_categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hidden_gems_ratings" ADD CONSTRAINT "hidden_gems_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hidden_gems_ratings" ADD CONSTRAINT "hidden_gems_ratings_hidden_gem_id_fkey" FOREIGN KEY ("hidden_gem_id") REFERENCES "hidden_gems"("hidden_gem_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hidden_gems_ratings" ADD CONSTRAINT "hidden_gems_ratings_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "hidden_gems_comments"("comment_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "operating_days_and_hours" ADD CONSTRAINT "operating_days_and_hours_hidden_gem_id_fkey" FOREIGN KEY ("hidden_gem_id") REFERENCES "hidden_gems"("hidden_gem_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hidden_gems_comments" ADD CONSTRAINT "hidden_gems_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hidden_gems_comments" ADD CONSTRAINT "hidden_gems_comments_hidden_gem_id_fkey" FOREIGN KEY ("hidden_gem_id") REFERENCES "hidden_gems"("hidden_gem_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hidden_gems_replies" ADD CONSTRAINT "hidden_gems_replies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hidden_gems_replies" ADD CONSTRAINT "hidden_gems_replies_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "hidden_gems_comments"("comment_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hidden_gems_replies" ADD CONSTRAINT "hidden_gems_replies_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "hidden_gems_replies"("reply_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "event_categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event_interests" ADD CONSTRAINT "event_interests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event_interests" ADD CONSTRAINT "event_interests_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event_operating_days_and_hours" ADD CONSTRAINT "event_operating_days_and_hours_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kanban_boards" ADD CONSTRAINT "kanban_boards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kanban_boards" ADD CONSTRAINT "kanban_boards_cover_id_fkey" FOREIGN KEY ("cover_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kanban_teams" ADD CONSTRAINT "kanban_teams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kanban_teams" ADD CONSTRAINT "kanban_teams_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "kanban_boards"("board_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kanban_cards" ADD CONSTRAINT "kanban_cards_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "kanban_boards"("board_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kanban_cards" ADD CONSTRAINT "kanban_cards_cover_id_fkey" FOREIGN KEY ("cover_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kanban_task_lists" ADD CONSTRAINT "kanban_task_lists_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "kanban_cards"("card_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kanban_members" ADD CONSTRAINT "kanban_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "kanban_teams"("team_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kanban_members" ADD CONSTRAINT "kanban_members_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "kanban_cards"("card_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kanban_public_access" ADD CONSTRAINT "kanban_public_access_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "kanban_boards"("board_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_ArticleTag" ADD CONSTRAINT "_ArticleTag_A_fkey" FOREIGN KEY ("A") REFERENCES "articles"("article_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleTag" ADD CONSTRAINT "_ArticleTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("tag_name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HiddenGemsFiles" ADD CONSTRAINT "_HiddenGemsFiles_A_fkey" FOREIGN KEY ("A") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HiddenGemsFiles" ADD CONSTRAINT "_HiddenGemsFiles_B_fkey" FOREIGN KEY ("B") REFERENCES "hidden_gems"("hidden_gem_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventFiles" ADD CONSTRAINT "_EventFiles_A_fkey" FOREIGN KEY ("A") REFERENCES "events"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventFiles" ADD CONSTRAINT "_EventFiles_B_fkey" FOREIGN KEY ("B") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
