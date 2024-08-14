import { DayOfWeek, PrismaClient } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';

export class HiddenGemsOperationDay extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const hiddenGems = await prisma.hiddenGems.findMany();
    const operationDays = hiddenGems.flatMap((hiddenGem) => {
      const numDays = faker.number.int({ min: 1, max: 7 });
      return Array.from({ length: numDays }).map((_, index) => {
        const dayOfWeek = [
          DayOfWeek.SUNDAY,
          DayOfWeek.MONDAY,
          DayOfWeek.TUESDAY,
          DayOfWeek.WEDNESDAY,
          DayOfWeek.THURSDAY,
          DayOfWeek.FRIDAY,
          DayOfWeek.SATURDAY,
        ][index % 7];
        const openTime = faker.date.recent().toISOString();
        const closeTime = new Date(
          new Date(openTime).getTime() +
            faker.number.int({ min: 30, max: 120 }) * 60000,
        ).toISOString();

        return {
          hidden_gem_id: hiddenGem.hidden_gem_id,
          day: dayOfWeek,
          open_time: openTime,
          close_time: closeTime,
        };
      });
    });

    await prisma.operatingDaysAndHours.createMany({
      data: operationDays,
    });

    console.log('Hidden Gems operation days seeded');
  }
}
