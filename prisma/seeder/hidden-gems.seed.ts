import { FileVisibility, PrismaClient, Role, Status } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';
import {
  deleteAllFiles,
  downloadAndSaveImage,
  hiddenGemsStorageConfig,
} from './../../src/common/utils';

export class HiddenGems extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    await deleteAllFiles(hiddenGemsStorageConfig);
    const users = await prisma.user.findMany({
      where: { role: Role.MEMBER },
    });

    const categories = await prisma.hiddenGemsCategory.findMany();

    const HiddenGems = Array.from({ length: 40 }, () => {
      const price_start = faker.number.int({ min: 100000, max: 1000000 });
      const price_end = faker.number.int({ min: price_start, max: 1000000 });
      return {
        title: faker.lorem.sentence(),
        price_start,
        price_end,
        status: faker.helpers.arrayElement([
          Status.PENDING,
          Status.APPROVE,
          Status.REJECT,
          Status.REVISION,
        ]),
        rating: faker.number.float({ min: 0, max: 5 }),
        user_id: faker.helpers.arrayElement(users).user_id,
        category_id: faker.helpers.arrayElement(categories).category_id,
        location: faker.location.city(),
        description: faker.lorem.paragraphs(),
      };
    });

    await Promise.all(
      HiddenGems.map(async (HiddenGem) => {
        const hidden = await prisma.hiddenGems.create({
          data: {
            title: HiddenGem.title,
            price_start: HiddenGem.price_start,
            price_end: HiddenGem.price_end,
            status: HiddenGem.status,
            User: {
              connect: { user_id: HiddenGem.user_id },
            },
            HiddenGemsCategory: {
              connect: { category_id: HiddenGem.category_id },
            },
            location: HiddenGem.location,
            description: HiddenGem.description,
          },
        });

        const image = await Array.from(
          { length: faker.number.int({ min: 1, max: 3 }) },
          () => {
            return faker.image.urlPicsumPhotos({
              width: 800,
              height: 600,
            });
          },
        );

        await Promise.all(
          image.map(async (url) => {
            const filename = await downloadAndSaveImage(
              url,
              hiddenGemsStorageConfig,
            );
            await prisma.file.create({
              data: {
                filename,
                visibility: FileVisibility.PUBLIC,
                HiddenGems: {
                  connect: { hidden_gem_id: hidden.hidden_gem_id },
                },
                User: {
                  connect: { user_id: hidden.user_id },
                },
              },
            });
          }),
        );
      }),
    );

    console.log('Hidden Gems seeded');
  }
}
