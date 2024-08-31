import { PrismaClient, Role } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';

export class EventInterestSeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const events = await prisma.event.findMany();
    const users = await prisma.user.findMany({
      where: { role: Role.MEMBER },
    });

    const eventInterests = await events.map((event) => {
      const randomUniqueUser = Array.from(
        { length: faker.number.int({ min: 1, max: users.length }) },
        (_, index) => {
          return users[index];
        },
      );

      return randomUniqueUser.map((user) => {
        return {
          event_id: event.event_id,
          user_id: user.user_id,
        };
      });
    });

    const flatEventInterests = eventInterests.flat();

    await Promise.all(
      flatEventInterests.map(async (eventInterest) => {
        await prisma.eventInterest.create({
          data: {
            User: {
              connect: { user_id: eventInterest.user_id },
            },
            Event: {
              connect: { event_id: eventInterest.event_id },
            },
          },
        });
      }),
    );
  }
}
