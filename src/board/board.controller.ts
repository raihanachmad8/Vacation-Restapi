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
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CurrentUser } from '@src/common/decorators/current-user.decorator';
import {
  ChangeRoleRequest,
  CreateBoardRequest,
  CreateCardKanbanRequest,
} from './dto';
import { AccessType, User } from '@prisma/client';
import {
  KanbanBoardModel,
  KanbanCardModel,
  KanbanTeamModel,
  WebResponse,
} from '@src/models';
import { BoardFilter } from './types';
import { UpdateBoardRequest } from './dto/update.dto';
import { UpdateCardKanbanRequest } from './dto/update-card.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('board')
export class BoardController {
  constructor(private boardService: BoardService) {}

  @Get(':board_id/team')
  @HttpCode(HttpStatus.OK)
  async getBoardTeamDetail(
    @Param('board_id') board_id: string,
    @CurrentUser() user: User,
    @Query('username') username?: string,
  ): Promise<WebResponse<KanbanTeamModel[]>> {
    const ConvertRequest = {
      board_id,
      username,
      user_id: user.user_id,
    };
    const board = await this.boardService.searchBoardTeam(ConvertRequest);
    return new WebResponse<KanbanTeamModel[]>({
      statusCode: 200,
      message: 'Board team detail',
      data: board,
    });
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('cover'))
  async createBoard(
    @CurrentUser() user: User,
    @Body() request: CreateBoardRequest,
    @UploadedFile() cover?: Express.Multer.File,
  ): Promise<WebResponse<KanbanBoardModel>> {
    const ConvertRequest = {
      ...request,
      cover: cover,
      user_id: user.user_id,
    };

    const board = await this.boardService.createBoard(ConvertRequest);
    return new WebResponse<KanbanBoardModel>({
      statusCode: 201,
      message: 'Board created',
      data: board,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBoard(
    @Query() filter: BoardFilter,
    @CurrentUser() user: User,
  ): Promise<WebResponse<KanbanBoardModel[]>> {
    const board = await this.boardService.searchBoardByUser(filter, user);
    return new WebResponse<KanbanBoardModel[]>({
      statusCode: 200,
      message: 'Board list',
      data: board.data,
      paging: board.paging,
    });
  }

  @Get(':board_id')
  @HttpCode(HttpStatus.OK)
  async getDetailBoard(
    @Param('board_id') board_id: string,
  ): Promise<WebResponse<KanbanBoardModel>> {
    const board = await this.boardService.getDetailBoard(board_id);
    return new WebResponse<KanbanBoardModel>({
      statusCode: 200,
      message: 'Board detail',
      data: board,
    });
  }

  @Post(':board_id')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('cover'))
  async createCard(
    @Param('board_id') board_id: string,
    @CurrentUser() user: User,
    @Body() request: CreateCardKanbanRequest,
    @UploadedFile() cover?: Express.Multer.File,
  ): Promise<WebResponse<KanbanCardModel>> {
    const ConvertRequest = {
      ...request,
      cover: cover,
      board_id: board_id,
      ...(request.tasklist && {
        tasklist: request.tasklist.map((tasklist) => ({
          ...tasklist,
          task: tasklist.task,
          is_done: this.customStringToBoolean(tasklist.is_done),
        })),
      }),
      ...(request.members && {
        members: request.members.map((member) => ({
          team_id: member.team_id,
        })),
      }),
      user_id: user.user_id,
    };
    console.log(ConvertRequest);

    const card = await this.boardService.createCard(ConvertRequest);
    return new WebResponse<KanbanCardModel>({
      statusCode: 201,
      message: 'Card created',
      data: card,
    });
  }

  @Get(':board_id/card/:card_id')
  @HttpCode(HttpStatus.OK)
  async getCard(
    @Param('board_id') board_id: string,
    @Param('card_id') card_id: string,
  ): Promise<WebResponse<KanbanCardModel>> {
    const ConvertRequest = {
      board_id,
      card_id,
    };
    const card = await this.boardService.getCard(ConvertRequest);
    return new WebResponse<KanbanCardModel>({
      statusCode: 200,
      message: 'Card list',
      data: card,
    });
  }

  @Put(':board_id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('cover'))
  async updateBoard(
    @CurrentUser() user: User,
    @Param('board_id') board_id: string,
    @Body() request: UpdateBoardRequest,
    @UploadedFile() cover?: Express.Multer.File,
  ): Promise<WebResponse<KanbanBoardModel>> {
    const ConvertRequest = {
      ...request,
      cover: cover,
      board_id,
      user_id: user.user_id,
    };

    const board = await this.boardService.updateBoard(ConvertRequest);
    return new WebResponse<KanbanBoardModel>({
      statusCode: 200,
      message: 'Board updated',
      data: board,
    });
  }

  @Put(':board_id/card/:card_id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('cover'))
  async updateCard(
    @CurrentUser() user: User,
    @Param('board_id') board_id: string,
    @Param('card_id') card_id: string,
    @Body() request: UpdateCardKanbanRequest,
    @UploadedFile() cover?: Express.Multer.File,
  ): Promise<WebResponse<KanbanCardModel>> {
    const ConvertRequest = {
      ...request,
      board_id,
      cover: cover,
      card_id,
      ...(request.tasklist && {
        tasklist: request.tasklist.map((tasklist) => ({
          ...tasklist,
          is_done: this.customStringToBoolean(tasklist.is_done),
        })),
      }),
      ...(request.members && {
        members: request.members.map((member) => ({
          team_id: member.team_id,
        })),
      }),
      user_id: user.user_id,
    };

    const card = await this.boardService.updateCard(ConvertRequest);
    return new WebResponse<KanbanCardModel>({
      statusCode: 200,
      message: 'Card updated',
      data: card,
    });
  }

  @Delete(':board_id')
  @HttpCode(HttpStatus.OK)
  async deleteBoard(
    @CurrentUser() user: User,
    @Param('board_id') board_id: string,
  ): Promise<WebResponse<KanbanBoardModel>> {
    await this.boardService.deleteBoard(board_id, user);
    return new WebResponse<KanbanBoardModel>({
      statusCode: 200,
      message: 'Board deleted',
    });
  }

  @Delete(':board_id/card/:card_id')
  @HttpCode(HttpStatus.OK)
  async deleteCard(
    @CurrentUser() user: User,
    @Param('board_id') board_id: string,
    @Param('card_id') card_id: string,
  ): Promise<WebResponse<KanbanCardModel>> {
    await this.boardService.deleteCard(board_id, card_id, user);
    return new WebResponse<KanbanCardModel>({
      statusCode: 200,
      message: 'Card deleted',
    });
  }

  @Post(':board_id/member/invite')
  @HttpCode(HttpStatus.CREATED)
  async inviteMember(
    @CurrentUser() user: User,
    @Param('board_id') board_id: string,
    @Body('username') username: string,
  ): Promise<WebResponse<KanbanTeamModel>> {
    const ConvertRequest = {
      board_id,
      username,
      user_id: user.user_id,
    };

    const board = await this.boardService.inviteTeam(ConvertRequest);
    return new WebResponse<KanbanTeamModel>({
      statusCode: 201,
      message: 'Member invited',
      data: board,
    });
  }

  @Get(':board_id/link')
  @HttpCode(HttpStatus.OK)
  async getBoardLinkDetail(
    @Param('board_id') board_id: string,
  ): Promise<WebResponse<{ link: string }>> {
    const link = await this.boardService.getLink(board_id);
    return new WebResponse<{ link: string }>({
      statusCode: 200,
      message: 'Board link',
      data: { link },
    });
  }

  @Post(':board_id/link/generate')
  @HttpCode(HttpStatus.OK)
  async getBoardLink(
    @Param('board_id') board_id: string,
    @CurrentUser() user: User,
    @Query('permission') permission?: AccessType,
  ): Promise<WebResponse<{ link: string }>> {
    const link = await this.boardService.generateLink(
      board_id,
      user,
      permission,
    );
    return new WebResponse<{ link: string }>({
      statusCode: 200,
      message: 'Board link',
      data: { link },
    });
  }

  @Post(':board_id/join/:hashed')
  @HttpCode(HttpStatus.CREATED)
  async joinBoardTeam(
    @CurrentUser() user: User,
    @Param('board_id') board_id: string,
    @Param('hashed') hashed: string,
  ): Promise<WebResponse<KanbanTeamModel>> {
    console.log(user, board_id, hashed);
    const ConvertRequest = {
      board_id,
      hashed,
      user_id: user.user_id,
    };

    const board = await this.boardService.joinTeam(ConvertRequest);
    return new WebResponse<KanbanTeamModel>({
      statusCode: 201,
      message: 'Member joined',
      data: board,
    });
  }

  @Delete(':board_id/member/:team_id')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @CurrentUser() user: User,
    @Param('board_id') board_id: string,
    @Param('team_id') team_id: string,
  ): Promise<WebResponse> {
    const ConvertRequest = {
      board_id,
      team_id,
      user_id: user.user_id,
    };

    await this.boardService.removeTeam(ConvertRequest);
    return new WebResponse({
      statusCode: 200,
      message: 'Member removed',
    });
  }

  @Patch(':board_id/member/:team_id/role')
  @HttpCode(HttpStatus.OK)
  async changePermission(
    @CurrentUser() user: User,
    @Param('board_id') board_id: string,
    @Param('team_id') team_id: string,
    @Body() request: ChangeRoleRequest,
  ): Promise<WebResponse> {
    const ConvertRequest = {
      board_id,
      team_id,
      role: request.role,
      user_id: user.user_id,
    };

    await this.boardService.teamChangeRole(ConvertRequest);
    return new WebResponse({
      statusCode: 200,
      message: 'Permission changed',
    });
  }

  @Delete(':board_id/member/leave')
  @HttpCode(HttpStatus.OK)
  async leaveBoard(
    @CurrentUser() user: User,
    @Param('board_id') board_id: string,
  ): Promise<WebResponse> {
    await this.boardService.leaveTeam(board_id, user);
    return new WebResponse({
      statusCode: 200,
      message: 'Member leave',
    });
  }

  @Patch(':board_id/member/:team_id/transfer/ownership')
  @HttpCode(HttpStatus.OK)
  async transferOwnership(
    @CurrentUser() user: User,
    @Param('board_id') board_id: string,
    @Param('team_id') team_id: string,
  ): Promise<WebResponse> {
    await this.boardService.teamChangeOwner(board_id, team_id, user);
    return new WebResponse({
      statusCode: 200,
      message: 'Ownership transferred',
    });
  }

  private customStringToBoolean = (value) => {
    const str = String(value).toLowerCase();
    return str === 'true' || str === '1' || value === true || value === 1;
  };
}
