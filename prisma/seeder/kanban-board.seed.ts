import { AccessType, PrismaClient } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';
import { hashLink } from './../../src/common/utils/security';

export class KanbanBoardSeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const user = await prisma.user.findMany();
    const board = Array.from({ length: 10 }).map((_, index) => {
      return {
        title: faker.lorem.words(3),
        user_id: faker.helpers.arrayElement(user).user_id,
        created_at: new Date(),
        updated_at: new Date(),
      };
    });

    await prisma.kanbanBoard.createMany({
      data: board,
    });

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
