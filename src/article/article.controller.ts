import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards';
import { Request } from 'express';
import { articleFilter } from './types';
import { Paging, WebResponse } from 'src/models';
import { createFileStorageConfig } from 'src/utils/file-storage-util';
import { FileVisibility } from '@prisma/client';
import { Public } from 'src/common/decorators';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor(
      'cover',
      createFileStorageConfig({
        visibility: FileVisibility.Public,
        storageFolder: 'articles',
      }),
    ),
  )
  async create(
    @Req() req: Request,
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
  ) {
    dto.user_id = req['user']['user_id'];
    dto.cover = cover.filename;
    const article = await this.articleService.create(dto);
    return new WebResponse<any>({
      message: 'Article created successfully',
      statusCode: HttpStatus.CREATED,
      data: article,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async getArticle(@Req() req: Request): Promise<WebResponse<any>> {
    const article = await this.articleService.find(req.params.id);
    return new WebResponse<any>({
      message: 'Article retrieved successfully',
      statusCode: HttpStatus.OK,
      data: article,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor(
      'cover',
      createFileStorageConfig({
        visibility: FileVisibility.Public,
        storageFolder: 'articles',
      }),
    ),
  )
  async updateArticle(
    @Req() req: Request,
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
  ): Promise<WebResponse<any>> {
    dto.user_id = req['user']['user_id'];
    dto.cover = cover.filename;
    await this.articleService.update(req.params.id, dto);
    return new WebResponse<any>({
      message: 'Article updated successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async deleteArticle(@Req() req: Request): Promise<WebResponse<any>> {
    await this.articleService.delete(req.params.id, req['user']['user_id']);
    return new WebResponse<any>({
      message: 'Article deleted successfully',
      statusCode: HttpStatus.OK,
    });
  }
}
