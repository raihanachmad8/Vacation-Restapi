import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { TagService } from './tag.service';
import { WebResponse } from '@src/models';
import { Public } from '@src/common/decorators';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Public()
  async getTags(
    @Query('search') search?: string,
  ): Promise<WebResponse<string[]>> {
    const tags = await this.tagService.getTags(search);
    return new WebResponse<string[]>({
      message: 'Tags retrieved successfully',
      statusCode: HttpStatus.OK,
      data: tags,
    });
  }
}
