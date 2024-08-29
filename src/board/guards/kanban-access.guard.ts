import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class KanbanAccessGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const board_id = request.params.board_id;

    console.log('user', user);
    console.log('board_id', board_id);
    console.log('request', request.params);

    if (!user || !board_id) {
      throw new ForbiddenException('Access denied');
    }

    const board = await this.prisma.kanbanBoard.findUnique({
      where: {
        board_id,
      },
    });
    if (!board) {
      throw new ForbiddenException('Board not found');
    }

    const teamEntry = await this.prisma.kanbanTeam.findFirst({
      where: {
        board_id: board_id,
        user_id: user.user_id,
      },
    });

    if (!teamEntry) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
