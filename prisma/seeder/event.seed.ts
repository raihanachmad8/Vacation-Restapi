import { FileVisibility, PrismaClient, Role, Status } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';
import { deleteAllFiles, downloadAndSaveImage } from '../../src/common/utils';
import { eventStorageConfig } from './../..//config/storage.config';

export class Event extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    await deleteAllFiles(eventStorageConfig);
    const users = await prisma.user.findMany({
      where: { role: Role.MEMBER },
    });

    const categories = await prisma.eventCategory.findMany();

    const Event = Array.from({ length: 10 }, () => {
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
        user_id: faker.helpers.arrayElement(users).user_id,
        category_id: faker.helpers.arrayElement(categories).category_id,
        location: faker.location.city(),
        description: faker.lorem.paragraphs(),
      };
    });

    await Promise.all(
      Event.map(async (Event) => {
        const event = await prisma.event.create({
          data: {
            title: Event.title,
            price_start: Event.price_start,
            price_end: Event.price_end,
            status: Event.status,
            User: {
              connect: { user_id: Event.user_id },
            },
            EventCategory: {
              connect: { category_id: Event.category_id },
            },
            location: Event.location,
            description: Event.description,
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
              eventStorageConfig,
            );
            await prisma.file.create({
              data: {
                filename,
                visibility: FileVisibility.PUBLIC,
                Event: {
                  connect: { event_id: event.event_id },
                },
                User: {
                  connect: { user_id: event.user_id },
                },
              },
            });
          }),
        );
      }),
    );

    console.log('Event seeded');
  }
}
