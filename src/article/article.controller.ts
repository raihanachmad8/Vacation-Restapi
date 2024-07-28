import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards';
import { articleFilter } from './types';
import { ArticleModel, Paging, WebResponse } from 'src/models';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('cover'))
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateArticleDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
          message: 'File size exceeds 5MB',
        })
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)/i,
        })
        .build(),
    )
    file: Express.Multer.File,
  ) {
    dto.user_id = user.user_id;
    const article = await this.articleService.create(dto, file);
    return new WebResponse<any>({
      message: 'Article created successfully',
      statusCode: HttpStatus.CREATED,
      data: article,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getArticles(
    @Query() query: articleFilter,
  ): Promise<WebResponse<Paging>> {
    const { data, paging } = await this.articleService.search(query);
    return new WebResponse<Paging>({
      message: 'Articles retrieved successfully',
      statusCode: HttpStatus.OK,
      data,
      paging,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getArticle(@Param('id') id: string): Promise<WebResponse<any>> {
    const article = await this.articleService.find(id);
    return new WebResponse<any>({
      message: 'Article retrieved successfully',
      statusCode: HttpStatus.OK,
      data: article,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('cover'))
  async updateArticle(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateArticleDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
          message: 'File size exceeds 5MB',
        })
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)/i,
        })
        .build(),
    )
    cover: Express.Multer.File,
  ): Promise<WebResponse<ArticleModel<User>>> {
    dto.user_id = user.user_id;
    const response = await this.articleService.update(id, dto, cover);
    return new WebResponse<ArticleModel<User>>({
      data: response,
      message: 'Article updated successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async deleteArticle(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<any>> {
    await this.articleService.delete(id, user.user_id);
    return new WebResponse<any>({
      message: 'Article deleted successfully',
      statusCode: HttpStatus.OK,
    });
  }
}
