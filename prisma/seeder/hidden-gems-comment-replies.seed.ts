import { PrismaClient, Role } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';

export class HiddenGemsCommentsReplies extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const users = await prisma.user.findMany({
      where: { role: Role.MEMBER },
    });

    const hiddenGemsComments = await prisma.hiddenGemsComment.findMany();

    const HiddenGemsCommentReplies = Array.from({ length: 40 }, () => {
      return {
        comment_id: faker.helpers.arrayElement(hiddenGemsComments).comment_id,
        comment: faker.lorem.sentence(),
        user_id: faker.helpers.arrayElement(users).user_id,
        rating: faker.number.float({ min: 0, max: 5 }),
      };
    });

    await Promise.all(
      HiddenGemsCommentReplies.map(async (HiddenGemsCommentReply) => {
        await prisma.hiddenGemsReply.create({
          data: {
            comment: HiddenGemsCommentReply.comment,
            rating: HiddenGemsCommentReply.rating,
            User: {
              connect: { user_id: HiddenGemsCommentReply.user_id },
            },
            HiddenGemsComment: {
              connect: { comment_id: HiddenGemsCommentReply.comment_id },
            },
          },
        });
      }),
    );

    console.log('Hidden Gems Comment Replies seeded');
  }
}
