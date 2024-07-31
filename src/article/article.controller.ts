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
import { articleFilter } from './types';
import { ArticleModel, Paging, WebResponse } from 'src/models';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ArticleStatus, Role, User } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Public } from 'src/common/decorators';
import { commentDto } from './dto/comment.dto';
import { Comment } from 'src/models/comment';

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
  @Public()
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
    await this.articleService.changeStatus(
      id,
      ArticleStatus.APPROVE,
      user.user_id,
    );
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
    await this.articleService.changeStatus(
      id,
      ArticleStatus.REVISION,
      user.user_id,
    );
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
    await this.articleService.changeStatus(
      id,
      ArticleStatus.REJECT,
      user.user_id,
    );
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
    await this.articleService.changeStatus(
      id,
      ArticleStatus.PENDING,
      user.user_id,
    );
    return new WebResponse<any>({
      message: 'Article changed to pending successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Post(':id/like')
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

  @Post(':id/bookmark')
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
  ): Promise<WebResponse<ArticleModel<User>[] | []>> {
    const articles = await this.articleService.getBookmark(user.user_id);
    return new WebResponse<ArticleModel<User>[] | []>({
      message: 'Bookmark retrieved successfully',
      statusCode: HttpStatus.OK,
      data: articles,
    });
  }

  @Post(':id/comment')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  async commentArticle(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() comment: commentDto,
  ): Promise<WebResponse<Comment>> {
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

  @Post(':id/comment/:comment_id/like')
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

  @Post(':id/comment/:comment_id/reply')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  async replyComment(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('comment_id') comment_id: string,
    @Body() comment: commentDto,
  ): Promise<WebResponse<Comment>> {
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

  @Post(':id/comment/:comment_id/reply/:reply_id')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  async replyReply(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('comment_id') comment_id: string,
    @Param('reply_id') reply_id: string,
    @Body() comment: commentDto,
  ): Promise<WebResponse<Comment>> {
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

  @Post(':id/comment/:comment_id/reply/:reply_id/like')
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
