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
    await HiddenGemsComments.seed(prisma),
    await HiddenGemsCommentsReplies.seed(prisma),
    await HiddenGemsCommentsRepliesReply.seed(prisma),
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
