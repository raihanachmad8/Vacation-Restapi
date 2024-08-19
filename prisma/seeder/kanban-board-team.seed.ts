import { AccessType, PrismaClient, KanbanRole } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';

export class KanbanBoardTeamSeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const board = await prisma.kanbanBoard.findMany();
    const user = await prisma.user.findMany();

    const lead = board.map((b) => {
      return {
        board_id: b.board_id,
        user_id: faker.helpers.arrayElement(user).user_id,
        role: KanbanRole.OWNER,
        permission: AccessType.EDIT,
        created_at: new Date(),
        updated_at: new Date(),
      };
    });

    const boardTeam = board.map((b) => {
      const team = Array.from({
        length: faker.number.int({ min: 1, max: 5 }),
      }).map((_, index) => {
        return {
          user_id: faker.helpers.arrayElement(user).user_id,
          board_id: b.board_id,
          created_at: new Date(),
          updated_at: new Date(),
        };
      });
      return team;
    });

    await prisma.kanbanTeam.createMany({
      data: lead,
    });

    await prisma.kanbanTeam.createMany({
      data: boardTeam.flat(),
    });

    console.log('Kanban Board Team seeded');
  }
}
