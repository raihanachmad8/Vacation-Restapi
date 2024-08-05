import { Status, FileVisibility, PrismaClient, Role } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { ContractSeeder } from './contract/seed.interface';
import {
  articleStorageConfig,
  deleteAllFiles,
  downloadAndSaveImage,
} from '@src/common/utils';

export class ArticleSeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    await deleteAllFiles(articleStorageConfig);

    // Fetch users with the MEMBER role
    const users = await prisma.user.findMany({
      where: { role: Role.MEMBER },
    });

    // Generate articles
    const articles = Array.from({ length: 30 }, () => {
      const tags = Array.from({ length: 3 }, () => faker.lorem.word());

      return {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(),
        status: faker.helpers.arrayElement([
          Status.PENDING,
          Status.APPROVE,
          Status.REJECT,
          Status.REVISION,
        ]),
        count_views: faker.number.int({ min: 0, max: 1000 }),
        count_likes: faker.number.int({ min: 0, max: 1000 }),
        user_id: faker.helpers.arrayElement(users).user_id,
        tag: tags,
      };
    });

    // Use a Set to keep track of unique tags
    const allTags = new Set<string>();
    articles.forEach((article) => {
      article.tag.forEach((tag) => allTags.add(tag));
    });

    // Upsert all unique tags
    const tagUpserts = Array.from(allTags).map((tag) =>
      prisma.tag.upsert({
        where: { tag_name: tag },
        update: {},
        create: { tag_name: tag },
      }),
    );

    const tagRecords = await Promise.all(tagUpserts);

    await Promise.all(
      articles.map(async (article) => {
        // Download and save cover image
        const coverFilename = await downloadAndSaveImage(
          faker.image.urlPicsumPhotos({
            width: 800,
            height: 400,
          }),
          articleStorageConfig,
        );

        // Create cover file record
        const coverData = await prisma.file.create({
          data: {
            filename: coverFilename,
            visibility: FileVisibility.PUBLIC,
            user_id: article.user_id,
          },
        });

        // Connect tags to the article
        const tags = tagRecords.filter((tag) =>
          article.tag.includes(tag.tag_name),
        );

        // Create the article
        await prisma.article.create({
          data: {
            title: article.title,
            Cover: { connect: { id: coverData.id } },
            content: article.content,
            status: article.status,
            User: { connect: { user_id: article.user_id } },
            Tag: {
              connect: tags.map((tag) => ({ tag_name: tag.tag_name })),
            },
          },
        });
      }),
    );

    console.log('Article seeding completed.');
  }
}
