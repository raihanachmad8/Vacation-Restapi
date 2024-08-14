import { PrismaClient } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';

export class EventOperationDaysAndHours extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const events = await prisma.event.findMany();

    const operationDays = events.flatMap((event) => {
      const numDays = faker.number.int({ min: 1, max: 7 });

      return Array.from({ length: numDays }).map(() => {
        const date = faker.date.recent();
        const openTime = new Date(date.getTime());
        const closeTime = new Date(
          date.getTime() + faker.number.int({ min: 30, max: 120 }) * 60000,
        );
        openTime.setFullYear(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        );
        closeTime.setFullYear(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        );

        return {
          event_id: event.event_id,
          date: date.toISOString(), // Extract date part only (YYYY-MM-DD)
          open_time: openTime.toISOString(),
          close_time: closeTime.toISOString(),
        };
      });
    });

    await Promise.all(
      operationDays.map(async (operationDay) => {
        await prisma.eventOperationDaysAndHours.create({
          data: {
            event_id: operationDay.event_id,
            date: operationDay.date,
            open_time: operationDay.open_time,
            close_time: operationDay.close_time,
          },
        });
      }),
    );

    console.log('Event operation days seeded');
  }
}
