import { PrismaClient, Role } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';

export class HiddenGemsCommentsRepliesReply extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const users = await prisma.user.findMany({
      where: { role: Role.MEMBER },
    });

    const hiddenGemsComments = await prisma.hiddenGemsComment.findMany();

    const HiddenGemsCommentReplies = await prisma.hiddenGemsReply.findMany();

    const HiddenGemsCommentRepliesReply = Array.from({ length: 10 }, () => {
      return {
        parent_id: faker.helpers.arrayElement(HiddenGemsCommentReplies)
          .reply_id,
        comment_id: faker.helpers.arrayElement(hiddenGemsComments).comment_id,
        comment: faker.lorem.sentence(),
        user_id: faker.helpers.arrayElement(users).user_id,
      };
    });

    await Promise.all(
      HiddenGemsCommentRepliesReply.map(async (HiddenGemsCommentReply) => {
        await prisma.hiddenGemsReply.create({
          data: {
            comment: HiddenGemsCommentReply.comment,
            User: {
              connect: { user_id: HiddenGemsCommentReply.user_id },
            },
            ParentReply: {
              connect: { reply_id: HiddenGemsCommentReply.parent_id },
            },
            HiddenGemsComment: {
              connect: { comment_id: HiddenGemsCommentReply.comment_id },
            },
          },
        });
      }),
    );

    console.log('Hidden Gems Comment Replies Reply seeded');
  }
}
