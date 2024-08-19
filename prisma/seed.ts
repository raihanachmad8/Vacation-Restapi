import { PrismaClient } from '@prisma/client';
import { UserSeeder } from './seeder/user.seed';
import { ArticleSeeder } from './seeder/article.seed';
import { ArticleCommentSeeder } from './seeder/article-comment.seed';
import { ArticleLikeSeeder } from './seeder/article-like.seed';
import { ArticleCommentLikeSeeder } from './seeder/article-comment-like.seed';
import { ArticleCommentReplySeeder } from './seeder/article-comment-reply.seed';
import { ArticleCommentReplyReplySeeder } from './seeder/article-comment-reply-reply.seed';
import { ArticleCommentReplyLikeSeeder } from './seeder/article-comment-reply-like.seed';
import { ArticleBookmarkSeeder } from './seeder/article-bookmark.seed';
import { HiddenGemsCategories } from './seeder/hidden-gems-category.seed';
import { HiddenGems } from './seeder/hidden-gems.seed';
import { HiddenGemsComments } from './seeder/hidden-gems-comment.seed';
import { HiddenGemsCommentsReplies } from './seeder/hidden-gems-comment-replies.seed';
import { HiddenGemsCommentsRepliesReply } from './seeder/hidden-gems-comment-replies-reply.seed';
import { HiddenGemsOperationDay } from './seeder/hidden-gems-operation-days.seed';
import { Event } from './seeder/event.seed';
import { EventOperationDaysAndHours } from './seeder/event-operation-day.seed';
import { EventCategories } from './seeder/event-category.seed';
import { KanbanBoardSeeder } from './seeder/kanban-board.seed';
import { KanbanBoardTeamSeeder } from './seeder/kanban-board-team.seed';
import { KanbanCardSeeder } from './seeder/kanban-card.seed';
const prisma = new PrismaClient();

async function main() {
  Promise.race([
    await UserSeeder.seed(prisma),
    await ArticleSeeder.seed(prisma),
    await ArticleBookmarkSeeder.seed(prisma),
    await ArticleCommentSeeder.seed(prisma),
    await ArticleLikeSeeder.seed(prisma),
    await ArticleCommentLikeSeeder.seed(prisma),
    await ArticleCommentReplySeeder.seed(prisma),
    await ArticleCommentReplyReplySeeder.seed(prisma),
    await ArticleCommentReplyLikeSeeder.seed(prisma),
    await HiddenGemsCategories.seed(prisma),
    await HiddenGems.seed(prisma),
    await HiddenGemsOperationDay.seed(prisma),
    await HiddenGemsComments.seed(prisma),
    await HiddenGemsCommentsReplies.seed(prisma),
    await HiddenGemsCommentsRepliesReply.seed(prisma),
    await EventCategories.seed(prisma),
    await Event.seed(prisma),
    await EventOperationDaysAndHours.seed(prisma),
    await KanbanBoardSeeder.seed(prisma),
    await KanbanBoardTeamSeeder.seed(prisma),
    await KanbanCardSeeder.seed(prisma),
  ]);
}

main()
  .catch((e) => {
    console.error('Unhandled error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
