import { PrismaClient } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';

export class HiddenGemsCommentsRating extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const HiddenGemsComments = await prisma.hiddenGemsComment.findMany();

    const rating = await HiddenGemsComments.map((comment) => {
      return {
        hiddden_gem_id: comment.hidden_gem_id,
        rating: faker.number.float({ min: 0, max: 5 }),
        user_id: comment.user_id,
        comment_id: comment.comment_id,
      };
    });

    await Promise.all(
      rating.map(async (rating) => {
        await prisma.hiddenGemsRating.create({
          data: {
            rating: rating.rating,
            User: {
              connect: { user_id: rating.user_id },
            },
            Comment: {
              connect: { comment_id: rating.comment_id },
            },
            HiddenGems: {
              connect: { hidden_gem_id: rating.hiddden_gem_id },
            },
          },
        });
      }),
    );

    console.log('Hidden Gems Comments Rating seeded');
  }
}
