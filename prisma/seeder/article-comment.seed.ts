import { PrismaClient } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';

export class ArticleCommentSeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const articles = await prisma.article.findMany();
    const users = await prisma.user.findMany();

    const articleComments = articles.map((article) => {
      const user = faker.helpers.arrayElement(users);
      return {
        article_id: article.article_id,
        user_id: user.user_id,
        content: faker.lorem.paragraph(),
      };
    });

    await Promise.all(
      articleComments.map((comment) =>
        prisma.articleComment.create({
          data: {
            article_id: comment.article_id,
            user_id: comment.user_id,
            comment: comment.content,
          },
        }),
      ),
    );

    console.log('Article comments seeding completed.');
  }
}
