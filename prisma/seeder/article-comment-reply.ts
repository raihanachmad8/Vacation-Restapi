import { PrismaClient } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';

export class ArticleCommentReplySeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const articleComments = await prisma.articleComment.findMany();
    const users = await prisma.user.findMany();

    const uniqueReplies = new Set<string>();

    const articleCommentReplies = users.flatMap((user) => {
      const repliesCount = faker.number.int({ min: 1, max: 5 });
      return Array.from({ length: repliesCount }, () => {
        const articleComment = faker.helpers.arrayElement(articleComments);
        const replyKey = `${articleComment.comment_id}-${user.user_id}`;

        if (!uniqueReplies.has(replyKey)) {
          uniqueReplies.add(replyKey);
          return {
            comment_id: articleComment.comment_id,
            user_id: user.user_id,
            content: faker.lorem.sentence(),
          };
        }
        return null;
      }).filter((reply) => reply !== null);
    });

    await Promise.all(
      articleCommentReplies.map((reply) =>
        prisma.articleCommentReply.create({
          data: {
            ArticleComment: {
              connect: {
                comment_id: reply.comment_id,
              },
            },
            User: {
              connect: {
                user_id: reply.user_id,
              },
            },
            comment: reply.content,
          },
        }),
      ),
    );

    console.log('Article comment replies seeding completed.');
  }
}
