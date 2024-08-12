import { PrismaClient } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';

export class ArticleCommentReplyLikeSeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const articleCommentReplies = await prisma.articleCommentReply.findMany();
    const users = await prisma.user.findMany();
    const uniqueReplies = new Set<string>();

    const articleCommentReplyLikes = users.flatMap((user) => {
      const likesCount = faker.number.int({ min: 1, max: 5 });
      return Array.from({ length: likesCount }, () => {
        const articleCommentReply = faker.helpers.arrayElement(
          articleCommentReplies,
        );
        const likeKey = `${articleCommentReply.reply_id}-${user.user_id}`;

        if (!uniqueReplies.has(likeKey)) {
          uniqueReplies.add(likeKey);
          return {
            reply_id: articleCommentReply.reply_id,
            user_id: user.user_id,
          };
        }
        return null;
      }).filter((reply) => reply !== null);
    });

    await Promise.all(
      articleCommentReplyLikes.map((like) =>
        prisma.articleCommentReplyLike.create({
          data: {
            ArticleCommentReply: {
              connect: {
                reply_id: like.reply_id,
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

    console.log('Article comment reply likes seeding completed.');
  }
}
