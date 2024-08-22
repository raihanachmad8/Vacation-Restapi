import { PrismaClient, Role } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';

export class HiddenGemsComments extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const users = await prisma.user.findMany({
      where: { role: Role.MEMBER },
    });

    const hiddenGems = await prisma.hiddenGems.findMany();

    const hiddenGemsComments = [];

    for (const hiddenGem of hiddenGems) {
      const numberOfUsers = faker.number.int({ min: 3, max: users.length });
      const selectedUsers = faker.helpers
        .shuffle(users)
        .slice(0, numberOfUsers);

      for (const user of selectedUsers) {
        hiddenGemsComments.push({
          comment: faker.lorem.sentence(),
          user_id: user.user_id,
          hidden_gem_id: hiddenGem.hidden_gem_id,
        });
      }
    }

    await Promise.all(
      hiddenGemsComments.map(async (comment) => {
        try {
          await prisma.hiddenGemsComment.create({
            data: {
              comment: comment.comment,
              User: {
                connect: { user_id: comment.user_id },
              },
              HiddenGems: {
                connect: { hidden_gem_id: comment.hidden_gem_id },
              },
            },
          });
        } catch (error) {
          if (error.code === 'P2002') {
            // Log or handle duplicate key errors
            console.error(
              `Duplicate entry for hidden_gem_id: ${comment.hidden_gem_id}, user_id: ${comment.user_id}`,
            );
          } else {
            throw error;
          }
        }
      }),
    );

    console.log('Hidden Gems Comments seeded');
  }
}
