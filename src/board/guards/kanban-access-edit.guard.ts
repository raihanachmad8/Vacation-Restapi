import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'; // Gantilah dengan path yang sesuai
import { PrismaService } from '@root/src/prisma/prisma.service';

@Injectable()
export class KanbanEditAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const board_id = request.params.board_id;
    if (!user || !board_id) {
      throw new ForbiddenException('Access denied');
    }

    const board = await this.prisma.kanbanBoard.findUnique({
      where: { board_id },
    });
    if (!board) {
      throw new ForbiddenException('Board not found');
    }

    const teamEntry = await this.prisma.kanbanTeam.findFirst({
      where: {
        board_id,
        user_id: user.user_id,
      },
    });

    if (!teamEntry || teamEntry.permission !== 'EDIT') {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
