import { PrismaClient } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';

export class ArticleCommentReplyReplySeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const articleComments = await prisma.articleComment.findMany();
    const existingReplies = await prisma.articleCommentReply.findMany();
    const uniqueReplies = new Set<string>();

    const articleCommentReplies = articleComments.flatMap((comment) => {
      const repliesCount = faker.number.int({ min: 1, max: 3 }); // Adjust as needed
      return Array.from({ length: repliesCount }, () => {
        const parentReply = faker.helpers.arrayElement(existingReplies);
        const replyKey = `${comment.comment_id}-${parentReply.reply_id}-${faker.string.uuid()}`;

        if (!uniqueReplies.has(replyKey)) {
          uniqueReplies.add(replyKey);
          return {
            comment_id: comment.comment_id,
            parent_id: parentReply.reply_id,
            user_id: faker.helpers.arrayElement(existingReplies).user_id,
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
            comment_id: reply.comment_id,
            parent_id: reply.parent_id,
            user_id: reply.user_id,
            comment: reply.content,
          },
        }),
      ),
    );

    console.log('Article comment replies seeding completed.');
  }
}
