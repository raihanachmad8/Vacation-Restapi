import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TagService {
  constructor(private prismaService: PrismaService) {}

  async getTags(search?: string): Promise<string[]> {
    const where = search
      ? {
          tag_name: {
            contains: search,
          },
        }
      : {};
    const tags = await this.prismaService.tag.findMany({
      where: where,
      select: { tag_name: true },
    });

    return tags.map((tag) => tag.tag_name);
  }
}
