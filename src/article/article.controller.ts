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
import { CreateArticleRequest, UpdateArticleRequest } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { articleFilter } from './types';
import { ArticleModel, WebResponse } from '@src/models';
import { CurrentUser } from '@src/common/decorators/current-user.decorator';
import { Status, Role, User } from '@prisma/client';
import { Roles } from '@src/common/decorators/role.decorator';
import { RolesGuard } from '@src/common/guards/roles.guard';
import { Public } from '@src/common/decorators';
import { CommentRequest } from './dto';
import { CommentModel } from '@src/models';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('cover'))
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  async create(
    @CurrentUser() user: User,
    @Body() request: CreateArticleRequest,
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
    request.user_id = user.user_id;
    const article = await this.articleService.create(request, file);
    return new WebResponse<any>({
      message: 'Article created successfully',
      statusCode: HttpStatus.CREATED,
      data: article,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Public()
  async getArticles(
    @Query() query: articleFilter,
  ): Promise<WebResponse<ArticleModel[]>> {
    const { data, paging } = await this.articleService.search(query);
    return new WebResponse<ArticleModel[]>({
      message: 'Articles retrieved successfully',
      statusCode: HttpStatus.OK,
      data,
      paging,
    });
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getArticle(
    @Param('id') id: string,
    @CurrentUser() user?: User,
  ): Promise<WebResponse<any>> {
    const article = await this.articleService.find(id, user?.user_id);
    return new WebResponse<any>({
      message: 'Article retrieved successfully',
      statusCode: HttpStatus.OK,
      data: article,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('cover'))
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  async updateArticle(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() request: UpdateArticleRequest,
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
  ): Promise<WebResponse<ArticleModel>> {
    request.user_id = user.user_id;
    const response = await this.articleService.update(id, request, cover);
    return new WebResponse<ArticleModel>({
      data: response,
      message: 'Article updated successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
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

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async approveArticle(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<any>> {
    await this.articleService.changeStatus(id, Status.APPROVE, user.user_id);
    return new WebResponse<any>({
      message: 'Article approved successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id/revision')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async revisionArticle(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<any>> {
    await this.articleService.changeStatus(id, Status.REVISION, user.user_id);
    return new WebResponse<any>({
      message: 'Article changed to revision successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async rejectArticle(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<any>> {
    await this.articleService.changeStatus(id, Status.REJECT, user.user_id);
    return new WebResponse<any>({
      message: 'Article rejected successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id/pending')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async pendingArticle(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<any>> {
    await this.articleService.changeStatus(id, Status.PENDING, user.user_id);
    return new WebResponse<any>({
      message: 'Article changed to pending successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id/like')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  async likeArticle(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<any>> {
    const like = await this.articleService.like(id, user.user_id);
    return new WebResponse<any>({
      message: 'Article liked successfully',
      statusCode: HttpStatus.OK,
      data: like,
    });
  }

  @Patch(':id/bookmark')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  async bookmarkArticle(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<any>> {
    const bookmark = await this.articleService.bookmark(id, user.user_id);
    return new WebResponse<any>({
      message: 'Article bookmarked successfully',
      statusCode: HttpStatus.OK,
      data: bookmark,
    });
  }

  @Get('bookmark/list')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  async getBookmark(
    @CurrentUser() user: User,
  ): Promise<WebResponse<ArticleModel[]>> {
    const articles = await this.articleService.getBookmark(user.user_id);
    return new WebResponse<ArticleModel[]>({
      message: 'Bookmark retrieved successfully',
      statusCode: HttpStatus.OK,
      data: articles,
    });
  }

  @Patch(':id/comment')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  async commentArticle(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() comment: CommentRequest,
  ): Promise<WebResponse<CommentModel>> {
    const response = await this.articleService.comment(
      id,
      user.user_id,
      comment,
    );
    return new WebResponse<any>({
      message: 'Comment added successfully',
      statusCode: HttpStatus.CREATED,
      data: response,
    });
  }

  @Patch(':id/comment/:comment_id/like')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  async likeComment(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('comment_id') comment_id: string,
  ): Promise<WebResponse<any>> {
    const like = await this.articleService.likeComment(
      id,
      comment_id,
      user.user_id,
    );
    return new WebResponse<any>({
      message: 'Comment liked successfully',
      statusCode: HttpStatus.OK,
      data: like,
    });
  }

  @Patch(':id/comment/:comment_id/reply')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  async replyComment(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('comment_id') comment_id: string,
    @Body() comment: CommentRequest,
  ): Promise<WebResponse<CommentModel>> {
    const response = await this.articleService.replyComment(
      id,
      comment_id,
      user.user_id,
      comment,
    );
    return new WebResponse<any>({
      message: 'Comment replied successfully',
      statusCode: HttpStatus.CREATED,
      data: response,
    });
  }

  @Patch(':id/comment/:comment_id/reply/:reply_id')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  async replyReply(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('comment_id') comment_id: string,
    @Param('reply_id') reply_id: string,
    @Body() comment: CommentRequest,
  ): Promise<WebResponse<CommentModel>> {
    const response = await this.articleService.replyReply(
      id,
      comment_id,
      reply_id,
      user.user_id,
      comment,
    );
    return new WebResponse<any>({
      message: 'Reply replied successfully',
      statusCode: HttpStatus.CREATED,
      data: response,
    });
  }

  @Patch(':id/comment/:comment_id/reply/:reply_id/like')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  async likeReply(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('comment_id') comment_id: string,
    @Param('reply_id') reply_id: string,
  ): Promise<WebResponse<any>> {
    const like = await this.articleService.likeReply(
      id,
      comment_id,
      reply_id,
      user.user_id,
    );
    return new WebResponse<any>({
      message: 'Reply liked successfully',
      statusCode: HttpStatus.OK,
      data: like,
    });
  }
}
