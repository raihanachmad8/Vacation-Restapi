import { PrismaClient, Role } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';

export class HiddenGemsComments extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const users = await prisma.user.findMany({
      where: { role: Role.MEMBER },
    });

    const hiddenGems = await prisma.hiddenGems.findMany();

    const HiddenGemsComments = Array.from({ length: 40 }, () => {
      return {
        comment: faker.lorem.sentence(),
        user_id: faker.helpers.arrayElement(users).user_id,
        hidden_gem_id: faker.helpers.arrayElement(hiddenGems).hidden_gem_id,
      };
    });

    await Promise.all(
      HiddenGemsComments.map(async (HiddenGemsComment) => {
        await prisma.hiddenGemsComment.create({
          data: {
            comment: HiddenGemsComment.comment,
            User: {
              connect: { user_id: HiddenGemsComment.user_id },
            },
            HiddenGems: {
              connect: { hidden_gem_id: HiddenGemsComment.hidden_gem_id },
            },
          },
        });
      }),
    );

    console.log('Hidden Gems Comments seeded');
  }
}
