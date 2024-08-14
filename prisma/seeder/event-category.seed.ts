import { PrismaClient } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';

export class EventCategories extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const categories = [
      'Arts and Culture',
      'Sports',
      'Culture and Tradition',
      'Education',
      'Business',
      'Community',
      'Technology',
      'Health',
      'Culinary',
      'Religion',
      'Entertainment',
      'Environment',
    ];

    const eventCategories = categories.map((category) => ({
      category_name: category,
    }));

    await prisma.eventCategory.createMany({
      data: eventCategories,
    });

    console.log('Event categories seeded');
  }
}
