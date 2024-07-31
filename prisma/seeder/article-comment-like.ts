import { PrismaClient } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';

export class ArticleCommentLikeSeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const articleComments = await prisma.articleComment.findMany();
    const users = await prisma.user.findMany();

    const uniqueLikes = new Set<string>();

    const articleCommentLikes = users.flatMap((user) => {
      const likesCount = faker.number.int({ min: 1, max: 5 });
      return Array.from({ length: likesCount }, () => {
        const articleComment = faker.helpers.arrayElement(articleComments);
        const likeKey = `${articleComment.comment_id}-${user.user_id}`;

        if (!uniqueLikes.has(likeKey)) {
          uniqueLikes.add(likeKey);
          return {
            comment_id: articleComment.comment_id,
            user_id: user.user_id,
          };
        }
        return null;
      }).filter((like) => like !== null);
    });

    await Promise.all(
      articleCommentLikes.map((like) =>
        prisma.articleCommentLike.create({
          data: {
            ArticleComment: {
              connect: {
                comment_id: like.comment_id,
              },
            },
            User: {
              connect: {
                user_id: like.user_id,
              },
            },
          },
        }),
      ),
    );

    console.log('Article comment likes seeding completed.');
  }
}
