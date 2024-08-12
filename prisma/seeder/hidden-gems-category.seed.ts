import { PrismaClient } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';

export class HiddenGemsCategories extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const categories = [
      'Hidden Tourist Spots',
      'Local Cuisine',
      'Culture and Traditions',
      'Unique Accommodations',
      'Experiences and Activities',
      'Photography Spots',
      'Local Shops and Crafts',
    ];

    const hiddenGemsCategories = categories.map((category) => ({
      category_name: category,
    }));

    await prisma.hiddenGemsCategory.createMany({
      data: hiddenGemsCategories,
    });

    console.log('Hidden gems categories seeded');
  }
}
