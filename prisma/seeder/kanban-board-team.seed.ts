import { AccessType, PrismaClient, KanbanRole } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import { faker } from '@faker-js/faker';

export class KanbanBoardTeamSeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const boards = await prisma.kanbanBoard.findMany();
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: 'ADMIN',
        },
      },
    });

    const leads = boards.map((board) => ({
      board_id: board.board_id,
      user_id: faker.helpers.arrayElement(users).user_id,
      role: KanbanRole.OWNER,
      permission: AccessType.EDIT,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const boardTeams = boards.flatMap((board) => {
      const availableUsers = users.filter(
        (user) =>
          !leads.some(
            (lead) =>
              lead.board_id === board.board_id && lead.user_id === user.user_id,
          ),
      );

      return Array.from({
        length: faker.number.int({ min: 1, max: availableUsers.length }),
      }).map((item, index) => ({
        board_id: board.board_id,
        user_id: availableUsers[index].user_id,
        role: KanbanRole.MEMBER,
        permission: AccessType.EDIT,
        created_at: new Date(),
        updated_at: new Date(),
      }));
    });

    await prisma.kanbanTeam.createMany({ data: leads });
    await prisma.kanbanTeam.createMany({ data: boardTeams });

    console.log('Kanban Board Team seeded');
  }
}
