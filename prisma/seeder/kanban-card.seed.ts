import {
  FileVisibility,
  KanbanPriority,
  KanbanStatus,
  PrismaClient,
} from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';
import { deleteAllFiles, downloadAndSaveImage } from './../../src/common/utils';
import { kanbanCardStorageConfig } from './../../config/storage.config';

export class KanbanCardSeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    await deleteAllFiles(kanbanCardStorageConfig);
    const board = await prisma.kanbanBoard.findMany();

    const cardPromises = board.map(async (board) => {
      const kanbanTeams = await prisma.kanbanTeam.findMany({
        where: {
          board_id: board.board_id,
        },
      });

      const cards = Array.from({
        length: faker.number.int({ min: 1, max: 10 }),
      }).map(async () => {
        const tasklist = Array.from({
          length: faker.number.int({ min: 1, max: 10 }),
        }).map(() => ({
          task: faker.lorem.words(3),
          is_done: faker.datatype.boolean(),
        }));

        return {
          board_id: board.board_id,
          title: faker.lorem.words(3),
          description: faker.lorem.words(10),
          status: faker.helpers.arrayElement([
            KanbanStatus.TODO,
            KanbanStatus.DOING,
            KanbanStatus.DONE,
          ]),
          priority: faker.helpers.arrayElement([
            KanbanPriority.LOW,
            KanbanPriority.MEDIUM,
            KanbanPriority.HIGH,
          ]),
          tasklist,
          team_id: faker.helpers.arrayElement(kanbanTeams).team_id,
          created_at: new Date(),
          updated_at: new Date(),
        };
      });

      return Promise.all(cards);
    });

    const card = (await Promise.all(cardPromises)).flat();

    await Promise.all(
      card.map(async (c) => {
        const coverFilename = await downloadAndSaveImage(
          faker.image.urlPicsumPhotos({
            width: 800,
            height: 400,
          }),
          kanbanCardStorageConfig,
        );

        const user = await prisma.kanbanTeam.findFirst({
          where: {
            team_id: c.team_id,
          },
        });
        await prisma.kanbanCard.create({
          data: {
            KanbanBoard: {
              connect: {
                board_id: c.board_id,
              },
            },
            title: c.title,
            description: c.description,
            status: c.status,
            priority: c.priority,
            KanbanTaskList: {
              create: c.tasklist,
            },
            Cover: {
              create: {
                User: {
                  connect: {
                    user_id: user.user_id,
                  },
                },
                filename: coverFilename,
                visibility: FileVisibility.PUBLIC,
              },
            },
            KanbanMember: {
              create: {
                KanbanTeam: {
                  connect: {
                    team_id: c.team_id,
                  },
                },
              },
            },
          },
        });
      }),
    );
    console.log('Kanban Card seeded');
  }
}
