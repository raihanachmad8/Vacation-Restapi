import { PrismaClient } from '@prisma/client';
import { UserSeeder } from './seeder/user.seed';
import { ArticleSeeder } from './seeder/article.seed';
import { ArticleCommentSeeder } from './seeder/article-comment';
import { ArticleLikeSeeder } from './seeder/article-like.seed';
import { ArticleCommentLikeSeeder } from './seeder/article-comment-like';
import { ArticleCommentReplySeeder } from './seeder/article-comment-reply';
import { ArticleCommentReplyReplySeeder } from './seeder/article-comment-reply-reply';
import { ArticleCommentReplyLikeSeeder } from './seeder/article-comment-reply-like';
import { ArticleBookmarkSeeder } from './seeder/article-bookmark';
import { HiddenGemsCategories } from './seeder/hidden-gems-category';
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
