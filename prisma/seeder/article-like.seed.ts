import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { ContractSeeder } from './contract/seed.interface';

export class ArticleLikeSeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const articles = await prisma.article.findMany();
    const users = await prisma.user.findMany();

    const uniqueLikes = new Set<string>();

    const articleLikes = users.flatMap((user) => {
      const likesCount = faker.number.int({ min: 1, max: 5 });
      return Array.from({ length: likesCount }, () => {
        const article = faker.helpers.arrayElement(articles);
        const likeKey = `${article.article_id}-${user.user_id}`;

        if (!uniqueLikes.has(likeKey)) {
          uniqueLikes.add(likeKey);
          return {
            article_id: article.article_id,
            user_id: user.user_id,
          };
        }
        return null;
      }).filter((like) => like !== null);
    });

    await Promise.all(
      articleLikes.map((like) =>
        prisma.articleLike.create({
          data: {
            article_id: like.article_id,
            user_id: like.user_id,
          },
        }),
      ),
    );

    console.log('Article likes seeding completed.');
  }
}
