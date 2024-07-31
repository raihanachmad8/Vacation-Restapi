import { PrismaClient } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';

export class ArticleBookmarkSeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const articles = await prisma.article.findMany();
    const users = await prisma.user.findMany();
    const uniqueBookmarks = new Set<string>();

    const articleBookmarks = users.flatMap((user) => {
      const bookmarksCount = faker.number.int({ min: 1, max: 10 });
      return Array.from({ length: bookmarksCount }, () => {
        const article = faker.helpers.arrayElement(articles);
        const bookmarkKey = `${article.article_id}-${user.user_id}`;

        if (!uniqueBookmarks.has(bookmarkKey)) {
          uniqueBookmarks.add(bookmarkKey);
          return {
            article_id: article.article_id,
            user_id: user.user_id,
          };
        }
        return null;
      }).filter((bookmark) => bookmark !== null);
    });
    await Promise.all(
      articleBookmarks.map((bookmark) =>
        prisma.articleBookmark.create({
          data: {
            article_id: bookmark.article_id,
            user_id: bookmark.user_id,
          },
        }),
      ),
    );

    console.log('Article bookmarks seeding completed.');
  }
}
