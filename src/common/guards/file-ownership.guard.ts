// file-ownership.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileVisibility } from '@prisma/client';

@Injectable()
export class FileOwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const filename = request.params.filename;

    if (!user || !user.user_id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const file = await this.prismaService.file.findFirst({
      where: { filename },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }
    console.log(file.visibility === FileVisibility.Public);
    console.log(file.user_id, user.user_id);
    console.log(file.user_id !== user.user_id);
    if (
      file.visibility === FileVisibility.Private &&
      file.user_id !== user.user_id
    ) {
      throw new ForbiddenException('Access denied to private file');
    }

    return true;
  }
}
