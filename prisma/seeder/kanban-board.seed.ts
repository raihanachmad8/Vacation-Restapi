import { AccessType, FileVisibility, PrismaClient } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';
import { hashLink } from './../../src/common/utils/security';
import { deleteAllFiles, downloadAndSaveImage } from './../../src/common/utils';
import { kanbanBoardStorageConfig } from './../../config/storage.config';

export class KanbanBoardSeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    await deleteAllFiles(kanbanBoardStorageConfig);
    const user = await prisma.user.findMany();
    const board = Array.from({ length: 10 }).map((_, index) => {
      return {
        title: faker.lorem.words(3),
        user_id: faker.helpers.arrayElement(user).user_id,
        created_at: new Date(),
        updated_at: new Date(),
      };
    });

    await Promise.all(
      board.map(async (board) => {
        await prisma.kanbanBoard.create({
          data: {
            title: board.title,
            User: {
              connect: { user_id: board.user_id },
            },
            created_at: board.created_at,
            updated_at: board.updated_at,
            Cover: {
              create: {
                filename: await downloadAndSaveImage(
                  faker.image.urlPicsumPhotos({
                    width: 800,
                    height: 400,
                  }),
                  kanbanBoardStorageConfig,
                ),
                User: {
                  connect: { user_id: board.user_id },
                },
                visibility: FileVisibility.PUBLIC,
              },
            },
          },
        });
      }),
    );

    const boards = await prisma.kanbanBoard.findMany();

    const linkAccessPromises = boards.map(async (board) => {
      const code = Math.random().toString(36).substring(7);
      const permission: AccessType = AccessType.VIEW;
      const hashed = await hashLink(`${board.board_id}-${code}-${permission}`);
      return {
        board_id: board.board_id,
        code,
        hashed,
        permission,
      };
    });

    const linkAccess = await Promise.all(linkAccessPromises);

    await prisma.kanbanPublicAccess.createMany({
      data: linkAccess,
    });
    console.log('Kanban Board seeded');
  }
}
