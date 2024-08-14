import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { CurrentUser } from '@src/common/decorators/current-user.decorator';
import { CreateHiddenGemsRequest, UpdateHiddenGemsRequest } from './dto';
import { RolesGuard } from '@src/common/guards/roles.guard';
import { Roles } from '@src/common/decorators/role.decorator';
import { HiddenGemsService } from './hidden-gems.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Public } from '@src/common/decorators';
import { hiddenGemsFilter } from './types';
import {
  WebResponse,
  HiddenGemsModel,
  HiddenGemsCommentModel,
  HiddenGemsCommentRepliesModel,
} from '@src/models';

@Controller('hidden-gems')
export class HiddenGemsController {
  constructor(private readonly hiddenGemsService: HiddenGemsService) {}

  @Public()
  @Get('categories')
  async getCategories(@Query('search') search?: string) {
    return this.hiddenGemsService.getCategories(search);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  @UseInterceptors(FilesInterceptor('photos'))
  @HttpCode(HttpStatus.CREATED)
  async createHiddenGems(
    @CurrentUser() user: User,
    @Body() createHiddenGemsRequest: CreateHiddenGemsRequest,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    const ConvertRequest = {
      ...createHiddenGemsRequest,
      price_start: Number(createHiddenGemsRequest.price_start),
      price_end: Number(createHiddenGemsRequest.price_end),
      rating: Number(createHiddenGemsRequest.rating),
      photos: photos,
      user_id: user.user_id,
    };
    return this.hiddenGemsService.createHiddenGems(ConvertRequest);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getHiddenGems(
    @Query() request: hiddenGemsFilter,
    @CurrentUser() user?: User,
  ): Promise<WebResponse<HiddenGemsModel[]>> {
    const ConvertRequest = {
      ...request,
      price_start: request?.price_start
        ? Number(request.price_start)
        : undefined,
      price_end: request?.price_end ? Number(request.price_end) : undefined,
      rating: request?.rating ? Number(request.rating) : undefined,
    };

    const response = await this.hiddenGemsService.search(ConvertRequest, user);

    return new WebResponse<HiddenGemsModel[]>({
      data: response.data,
      message: 'Hidden gems fetched successfully',
      statusCode: HttpStatus.OK,
      paging: response.paging,
    });
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getHiddenGemsById(
    @Param('id') id: string,
    @CurrentUser() user?: User,
  ): Promise<WebResponse<HiddenGemsModel>> {
    const response = await this.hiddenGemsService.getHiddenGemsById(id, user);

    return new WebResponse<HiddenGemsModel>({
      data: response,
      message: 'Hidden gems fetched successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  @UseInterceptors(FilesInterceptor('photos'))
  @HttpCode(HttpStatus.OK)
  async updateHiddenGems(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() request: Partial<UpdateHiddenGemsRequest>,
    @UploadedFiles() photos: Express.Multer.File[],
  ): Promise<WebResponse<HiddenGemsModel>> {
    const ConvertRequest = {
      ...request,
      hidden_gems_id: id,
      price_start: Number(request.price_start),
      price_end: Number(request.price_end),
      rating: Number(request.rating),
      photos: photos,
      user_id: user.user_id,
    };
    const response = await this.hiddenGemsService.updateHiddenGems(
      ConvertRequest,
      user,
    );

    return new WebResponse<HiddenGemsModel>({
      data: response,
      message: 'Hidden gems updated successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  @HttpCode(HttpStatus.OK)
  async deleteHiddenGems(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<HiddenGemsModel>> {
    await this.hiddenGemsService.deleteHiddenGems(id, user);

    return new WebResponse<HiddenGemsModel>({
      message: 'Hidden gems deleted successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async approveHiddenGems(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<HiddenGemsModel>> {
    const response = await this.hiddenGemsService.changeStatus(
      id,
      'APPROVE',
      user,
    );

    return new WebResponse<HiddenGemsModel>({
      data: response,
      message: 'Hidden gems approved successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id/revision')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async revisionHiddenGems(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<HiddenGemsModel>> {
    const response = await this.hiddenGemsService.changeStatus(
      id,
      'REVISION',
      user,
    );

    return new WebResponse<HiddenGemsModel>({
      data: response,
      message: 'Hidden gems changed to revision successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async rejectHiddenGems(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<HiddenGemsModel>> {
    const response = await this.hiddenGemsService.changeStatus(
      id,
      'REJECT',
      user,
    );

    return new WebResponse<HiddenGemsModel>({
      data: response,
      message: 'Hidden gems rejected successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id/pending')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async pendingHiddenGems(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<HiddenGemsModel>> {
    const response = await this.hiddenGemsService.changeStatus(
      id,
      'PENDING',
      user,
    );

    return new WebResponse<HiddenGemsModel>({
      data: response,
      message: 'Hidden gems changed to pending successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id/comment')
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  @HttpCode(HttpStatus.OK)
  async commentHiddenGems(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() request: { comment: string; rating: number },
  ): Promise<WebResponse<HiddenGemsCommentModel>> {
    const ConvertRequest = {
      ...request,
      user_id: user.user_id,
      rating: Number(request.rating),
      hidden_gems_id: id,
    };
    const response =
      await this.hiddenGemsService.commentHiddenGems(ConvertRequest);

    return new WebResponse<HiddenGemsCommentModel>({
      data: response,
      message: 'Comment added successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id/comment/:comment_id/reply')
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  @HttpCode(HttpStatus.OK)
  async replyCommentHiddenGems(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('comment_id') comment_id: string,
    @Body() request: { comment: string; rating: number },
  ): Promise<WebResponse<HiddenGemsCommentRepliesModel>> {
    const ConvertRequest = {
      ...request,
      user_id: user.user_id,
      hidden_gems_id: id,
      rating: Number(request.rating),
      comment_id: comment_id,
    };
    const response =
      await this.hiddenGemsService.replyCommentHiddenGems(ConvertRequest);

    return new WebResponse<HiddenGemsCommentRepliesModel>({
      data: response,
      message: 'Reply added successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id/comment/:comment_id/reply/:reply_id')
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  @HttpCode(HttpStatus.OK)
  async replyReplyCommentHiddenGems(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('comment_id') comment_id: string,
    @Param('reply_id') reply_id: string,
    @Body() request: { comment: string; rating: number },
  ): Promise<WebResponse<HiddenGemsCommentRepliesModel>> {
    const ConvertRequest = {
      ...request,
      user_id: user.user_id,
      hidden_gems_id: id,
      comment_id: comment_id,
      rating: Number(request.rating),
      parent_id: reply_id,
    };
    const response =
      await this.hiddenGemsService.replyReplyCommentHiddenGems(ConvertRequest);

    return new WebResponse<HiddenGemsCommentRepliesModel>({
      data: response,
      message: 'Reply added successfully',
      statusCode: HttpStatus.OK,
    });
  }
}
