import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import {
  ChangeRoleRequest,
  CreateBoardRequest,
  CreateCardKanbanRequest,
  JoinTeamRequest,
} from './dto';
import { BoardFilter } from './types';
import {
  KanbanBoardModel,
  KanbanCardModel,
  KanbanTeamModel,
  Paging,
} from '@src/models';
import { ValidationService } from '@src/common/validation.service';
import { BoardValidation } from './board.validation';
import { UpdateCardKanbanRequest } from './dto/update-card.dto';
import { UpdateBoardRequest } from './dto/update.dto';
import { appUrl, deleteFile, uploadFile } from '@src/common/utils';
import { InviteTeamRequest } from './dto/invite-team.dto';
import { AccessType, FileVisibility, KanbanRole, User } from '@prisma/client';
import { hashLink, validateHashLink } from '@src/common/utils/security';
import {
  kanbanBoardStorageConfig,
  kanbanCardStorageConfig,
} from '@root/config/storage.config';
import { FileStorageOptions } from '../file-storage/types';

@Injectable()
export class BoardService {
  private readonly kanbanBoardStorageConfig: FileStorageOptions =
    kanbanBoardStorageConfig;

  private readonly kanbanCardStorageConfig: FileStorageOptions =
    kanbanCardStorageConfig;

  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async searchBoardTeam(query: {
    board_id: string;
    user_id: string;
    username?: string;
  }): Promise<KanbanTeamModel[]> {
    const ValidatedRequest = this.validationService.validate(
      BoardValidation.BOARD_TEAM_FILTER,
      query,
    );
    const { board_id, username } = ValidatedRequest;
    const board = await this.prismaService.kanbanTeam.findMany({
      where: {
        board_id,
        User: {
          username: {
            startsWith: username,
          },
        },
      },
      include: {
        User: true,
      },
      take: 10,
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return await Promise.all(board.map(KanbanTeamModel.toJson));
  }

  async createBoard(request: CreateBoardRequest): Promise<KanbanBoardModel> {
    const ValidatedRequest = this.validationService.validate(
      BoardValidation.CREATE_BOARD_REQUEST,
      request,
    );
    let coverFileName: string;
    const { cover, title, user_id } = ValidatedRequest;
    try {
      const board = await this.prismaService.$transaction(async (prisma) => {
        if (cover) {
          coverFileName = await uploadFile(
            cover,
            this.kanbanBoardStorageConfig,
          );
        }
        return prisma.kanbanBoard.create({
          data: {
            title,
            User: {
              connect: {
                user_id: user_id,
              },
            },
            ...(coverFileName && {
              Cover: {
                create: {
                  filename: coverFileName,
                  visibility: FileVisibility.PUBLIC,
                  User: {
                    connect: {
                      user_id,
                    },
                  },
                },
              },
            }),
            KanbanTeam: {
              create: {
                User: {
                  connect: {
                    user_id,
                  },
                },
                permission: AccessType.EDIT,
                role: KanbanRole.OWNER,
              },
            },
          },
          include: {
            User: true,
            Cover: true,
            KanbanTeam: {
              include: {
                User: true,
              },
            },
          },
        });
      });

      await this.generateLink(board.board_id, board.User, AccessType.VIEW);

      return KanbanBoardModel.toJson(board);
    } catch (error) {
      try {
        const deleteMessage = await deleteFile(
          coverFileName,
          this.kanbanBoardStorageConfig,
        );
        console.error(deleteMessage);
      } catch (error) {
        console.error(error.message);
      }
      throw new InternalServerErrorException(
        `Error creating article: ${error.message}`,
      );
    }
  }

  async getDetailBoard(board_id: string): Promise<KanbanBoardModel> {
    const board = await this.prismaService.kanbanBoard.findUnique({
      where: {
        board_id,
      },
      include: {
        User: true,
        Cover: true,
        KanbanTeam: {
          include: {
            User: true,
          },
        },
        KanbanCard: {
          include: {
            KanbanTaskList: true,
            KanbanMember: {
              include: {
                KanbanTeam: {
                  include: {
                    User: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return KanbanBoardModel.toJson(board);
  }

  async searchBoardByUser(
    query: BoardFilter,
    user: User,
  ): Promise<{ data: KanbanBoardModel[]; paging: Paging }> {
    try {
      const allBoard = await this.prismaService.kanbanBoard.findMany();
      const link = await Promise.all(
        allBoard.map(async (board) => {
          const code = Math.random().toString(36).substring(7);
          const permission: AccessType = AccessType.VIEW;
          const hashed = await hashLink(
            `${board.board_id}-${code}-${permission}`,
          );
          return {
            board_id: board.board_id,
            code,
            hashed,
            permission,
          };
        }),
      );

      await this.prismaService.kanbanPublicAccess.createMany({
        data: link,
      });
    } catch (error) {
      console.log(error);
    }
    const ValidatedRequest = this.validationService.validate(
      BoardValidation.BOARD_FILTER,
      query,
    );
    const {
      s,
      page = 1,
      limit = 10,
      order = 'asc',
      orderBy = 'updated_at',
    } = ValidatedRequest;
    const take = limit || 10;
    const skip = (page - 1) * take;
    const where = {
      ...(s
        ? {
            title: {
              contains: s,
            },
          }
        : {}),
    };

    const [boards, total] = await Promise.all([
      this.prismaService.kanbanBoard.findMany({
        where: {
          ...where,
          KanbanTeam: {
            some: {
              User: {
                user_id: user.user_id,
              },
            },
          },
        },
        take,
        skip,
        orderBy: {
          [orderBy]: order,
        },
        include: {
          User: true,
          Cover: true,
          KanbanTeam: {
            include: {
              User: true,
            },
          },
        },
      }),
      this.prismaService.kanbanBoard.count({
        where: {
          ...where,
          KanbanTeam: {
            some: {
              User: {
                user_id: user.user_id,
              },
            },
          },
        },
      }),
    ]);

    return {
      data: await Promise.all(boards.map(KanbanBoardModel.toJson)),
      paging: {
        total,
        first_page: 1,
        last_page: Math.ceil(total / take),
        current_page: page,
      },
    };
  }

  async createCard(request: CreateCardKanbanRequest): Promise<KanbanCardModel> {
    const ValidatedRequest = this.validationService.validate(
      BoardValidation.CREATE_CARD_KANBAN_REQUEST,
      request,
    );
    const {
      cover,
      board_id,
      title,
      description,
      priority,
      status,
      tasklist,
      members,
      user_id,
    } = ValidatedRequest;
    const board = await this.prismaService.kanbanBoard.findUnique({
      where: {
        board_id,
      },
    });
    if (!board) {
      throw new NotFoundException('Board not found');
    }

    let coverFileName: string;

    try {
      const card = await this.prismaService.$transaction(async (prisma) => {
        if (cover) {
          coverFileName = await uploadFile(cover, this.kanbanCardStorageConfig);
        }
        return prisma.kanbanCard.create({
          data: {
            title,
            description,
            priority,
            status,
            ...(coverFileName && {
              Cover: {
                create: {
                  filename: coverFileName,
                  visibility: FileVisibility.PUBLIC,
                  User: {
                    connect: {
                      user_id,
                    },
                  },
                },
              },
            }),
            KanbanTaskList: {
              create: tasklist,
            },
            KanbanMember: {
              create: members,
            },
            KanbanBoard: {
              connect: {
                board_id,
              },
            },
          },
          include: {
            KanbanTaskList: true,
            Cover: true,
            KanbanMember: {
              include: {
                KanbanTeam: {
                  include: {
                    User: true,
                  },
                },
              },
            },
          },
        });
      });

      return KanbanCardModel.toJson(card);
    } catch (error) {
      try {
        const deleteMessage = await deleteFile(
          coverFileName,
          this.kanbanCardStorageConfig,
        );
        console.error(deleteMessage);
      } catch (error) {
        console.error(error.message);
      }
      throw new InternalServerErrorException(
        `Error creating article: ${error.message}`,
      );
    }
  }

  async getCard({ board_id, card_id }): Promise<KanbanCardModel> {
    const card = await this.prismaService.kanbanCard.findFirst({
      where: {
        board_id,
        card_id,
      },
      include: {
        KanbanTaskList: true,
        Cover: true,
        KanbanMember: {
          include: {
            KanbanTeam: {
              include: {
                User: true,
              },
            },
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return await KanbanCardModel.toJson(card);
  }

  async updateCard(request: UpdateCardKanbanRequest): Promise<KanbanCardModel> {
    const ValidatedRequest = this.validationService.validate(
      BoardValidation.UPDATE_CARD_KANBAN_REQUEST,
      request,
    );

    const {
      card_id,
      cover,
      title,
      description,
      priority,
      status,
      tasklist = [],
      members = [],
      user_id,
    } = ValidatedRequest;

    let coverFileName: string;
    try {
      const existingCard = await this.prismaService.kanbanCard.findUnique({
        where: {
          card_id,
        },
        include: {
          KanbanTaskList: true,
          Cover: true,
          KanbanMember: true,
        },
      });

      if (!existingCard) {
        throw new NotFoundException('Card not found');
      }

      const existingTaskIds = existingCard.KanbanTaskList.map(
        (task) => task.task_list_id,
      );
      const newTaskIds = tasklist
        .map((task) => task.task_list_id)
        .filter((id) => id !== undefined);

      const tasksToCreate = tasklist
        .filter((task) => !task.task_list_id)
        .map((task) => ({
          task: task.task,
          is_done: Boolean(task.is_done),
        }));

      const tasksToUpdate = tasklist
        .filter((task) => task.task_list_id)
        .map((task) => ({
          where: {
            task_list_id: task.task_list_id,
          },
          data: {
            task: task.task,
            is_done: Boolean(task.is_done),
          },
        }));

      const tasksToDelete = existingTaskIds
        .filter((id) => !newTaskIds.includes(id))
        .map((id) => ({
          task_list_id: id,
        }));

      const existingMemberIds = existingCard.KanbanMember.map(
        (member) => member.team_id,
      );
      const newMemberIds = members
        .map((member) => member?.team_id)
        .filter((id) => id !== undefined);

      const membersToCreate = members
        .filter((member) => !member.team_id)
        .map((member) => ({
          team_id: member.team_id,
        }));

      const membersToUpdate = members
        .filter((member) => member.team_id)
        .map((member) => ({
          where: {
            team_id: member.team_id,
          },
          data: {
            team_id: member.team_id,
          },
        }));

      const membersToDelete = existingMemberIds
        .filter((id) => !newMemberIds.includes(id))
        .map((id) => ({
          team_id: id,
        }));

      if (cover) {
        coverFileName = await uploadFile(cover, this.kanbanCardStorageConfig);
      }

      const card = await this.prismaService.kanbanCard.update({
        where: {
          card_id,
        },
        data: {
          title,
          description,
          priority,
          status,
          KanbanTaskList: {
            deleteMany: {
              task_list_id: {
                in: tasksToDelete.map((task) => task.task_list_id),
              },
            },
            create: tasksToCreate,
            updateMany: tasksToUpdate,
          },
          Cover: coverFileName
            ? {
                create: {
                  filename: coverFileName,
                  visibility: FileVisibility.PUBLIC,
                  User: {
                    connect: {
                      user_id: user_id,
                    },
                  },
                },
              }
            : {
                delete: existingCard.Cover
                  ? { filename: existingCard.Cover.filename }
                  : undefined,
              },
          KanbanMember: {
            deleteMany: {
              team_id: {
                in: membersToDelete.map((member) => member.team_id),
              },
            },
            create: membersToCreate,
            updateMany: membersToUpdate,
          },
        },
        include: {
          Cover: true,
          KanbanTaskList: true,
          KanbanMember: {
            include: {
              KanbanTeam: {
                include: {
                  User: true,
                },
              },
            },
          },
        },
      });

      return await KanbanCardModel.toJson(card);
    } catch (error) {
      if (coverFileName) {
        try {
          const deleteMessage = await deleteFile(
            coverFileName,
            this.kanbanCardStorageConfig,
          );
          console.error(deleteMessage);
        } catch (error) {
          console.error('Error deleting file:', error.message);
        }
      }
      console.error('Error updating card:', error);
      throw error;
    }
  }

  async updateBoard(request: UpdateBoardRequest): Promise<KanbanBoardModel> {
    const ValidatedRequest = this.validationService.validate(
      BoardValidation.UPDATE_BOARD_REQUEST,
      request,
    );
    const { cover, board_id, title, user_id } = ValidatedRequest;

    const board = await this.prismaService.kanbanBoard.findUnique({
      where: {
        board_id,
      },
      include: {
        Cover: true,
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }
    let coverFileName: string;
    try {
      const boardUpdate = await this.prismaService.$transaction(
        async (prisma) => {
          if (cover) {
            coverFileName = cover
              ? await uploadFile(cover, this.kanbanBoardStorageConfig)
              : null;
          }

          return prisma.kanbanBoard.update({
            where: {
              board_id,
            },
            data: {
              title,
              Cover: coverFileName
                ? {
                    create: {
                      filename: coverFileName,
                      visibility: FileVisibility.PUBLIC,
                      User: {
                        connect: {
                          user_id: user_id,
                        },
                      },
                    },
                  }
                : {
                    delete: board.Cover
                      ? { filename: board.Cover.filename }
                      : undefined,
                  },
            },
            include: {
              User: true,
              Cover: true,
              KanbanTeam: {
                include: {
                  User: true,
                },
              },
            },
          });
        },
      );

      return await KanbanBoardModel.toJson(boardUpdate);
    } catch (error) {
      try {
        const deleteMessage = await deleteFile(
          coverFileName,
          this.kanbanBoardStorageConfig,
        );
        console.error(deleteMessage);
      } catch (error) {
        console.error(error.message);
      }

      throw new InternalServerErrorException(
        `Error creating article: ${error.message}`,
      );
    }
  }

  async deleteBoard(board_id: string, user: User): Promise<void> {
    const board = await this.prismaService.kanbanBoard.findUnique({
      where: {
        board_id,
        user_id: user.user_id,
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    await this.prismaService.kanbanBoard.delete({
      where: {
        board_id,
      },
    });
  }

  async deleteCard(
    board_id: string,
    card_id: string,
    user: User,
  ): Promise<void> {
    const card = await this.prismaService.kanbanCard.findUnique({
      where: {
        card_id,
        board_id,
      },
      include: {
        KanbanMember: {
          include: {
            KanbanTeam: {
              include: {
                User: true,
              },
            },
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (
      card.KanbanMember.some(
        (member) => member.KanbanTeam.User.user_id === user.user_id,
      ) &&
      card.KanbanMember.some(
        (member) => member.KanbanTeam.role === KanbanRole.OWNER,
      )
    ) {
      throw new ForbiddenException('Permission denied');
    }

    await this.prismaService.kanbanCard.delete({
      where: {
        card_id,
      },
    });
  }

  async inviteTeam(request: InviteTeamRequest): Promise<KanbanTeamModel> {
    const ValidatedRequest = this.validationService.validate(
      BoardValidation.INVITE_TEAM_REQUEST,
      request,
    );

    const { board_id, username } = ValidatedRequest;
    const user = await this.prismaService.user.findFirst({
      where: {
        username,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const board = await this.prismaService.kanbanBoard.findUnique({
      where: {
        board_id,
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const existingTeam = await this.prismaService.kanbanTeam.findFirst({
      where: {
        board_id,
        user_id: user.user_id,
      },
    });

    if (existingTeam) {
      throw new ConflictException('User already in team');
    }

    const newMember = await this.prismaService.kanbanTeam.create({
      data: {
        board_id,
        user_id: user.user_id,
        permission: AccessType.VIEW,
        role: KanbanRole.MEMBER,
      },
      include: {
        User: true,
      },
    });

    return await KanbanTeamModel.toJson(newMember);
  }

  async getLink(board_id: string): Promise<string> {
    const board = await this.prismaService.kanbanPublicAccess.findFirst({
      where: {
        board_id,
      },
    });

    if (!board) {
      throw new NotFoundException('Link not found');
    }

    const url = `${appUrl}/api/board/${board_id}/join/${board.hashed}`;

    return url;
  }

  async generateLink(
    board_id: string,
    user: User,
    permission: AccessType = AccessType.VIEW,
  ): Promise<string> {
    const board = await this.prismaService.kanbanBoard.findUnique({
      where: {
        board_id,
        KanbanTeam: {
          some: {
            user_id: user.user_id,
          },
        },
      },
      include: {
        KanbanTeam: true,
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.KanbanTeam.some((team) => team.role === KanbanRole.MEMBER)) {
      throw new ForbiddenException('Permission denied');
    }

    const code = Math.random().toString(36).substring(7);
    const hashed = await hashLink(`${board_id}-${code}-${permission}`);

    const link = `${appUrl}/api/board/${board_id}/join/` + hashed;

    await this.prismaService.kanbanPublicAccess.create({
      data: {
        board_id,
        code,
        hashed,
        permission,
      },
    });

    await this.prismaService.kanbanPublicAccess.deleteMany({
      where: {
        board_id,
        code: {
          not: code,
        },
      },
    });

    return link;
  }

  async joinTeam(joinRequest: JoinTeamRequest): Promise<KanbanTeamModel> {
    const ValidatedRequest = this.validationService.validate(
      BoardValidation.JOIN_TEAM_REQUEST,
      joinRequest,
    );

    const { board_id, hashed, user_id } = ValidatedRequest;

    const board = await this.prismaService.kanbanPublicAccess.findFirst({
      where: {
        board_id,
      },
    });

    if (
      !board ||
      !validateHashLink(`${board_id}-${board.code}-${board.permission}`, hashed)
    ) {
      throw new NotFoundException('Invalid link');
    }

    const existingTeam = await this.prismaService.kanbanTeam.findFirst({
      where: {
        board_id,
        user_id: user_id,
      },
    });

    if (existingTeam) {
      throw new ConflictException('User already in team');
    }

    const team = await this.prismaService.kanbanTeam.create({
      data: {
        board_id,
        user_id: user_id,
        permission: board.permission,
        role:
          board.permission === AccessType.EDIT
            ? KanbanRole.ADMIN
            : KanbanRole.MEMBER,
      },
      include: {
        User: true,
      },
    });

    return await KanbanTeamModel.toJson(team);
  }

  async leaveTeam(board_id: string, user: User): Promise<void> {
    const team = await this.prismaService.kanbanTeam.findFirst({
      where: {
        board_id,
        user_id: user.user_id,
      },
    });

    if (!team) {
      throw new NotFoundException('User not in team');
    }

    const owner = await this.prismaService.kanbanTeam.findFirst({
      where: {
        board_id,
        role: KanbanRole.OWNER,
      },
    });

    if (team.role === KanbanRole.OWNER && owner.user_id === user.user_id) {
      throw new ForbiddenException('Owner cannot leave');
    }

    await this.prismaService.kanbanTeam.delete({
      where: {
        team_id: team.team_id,
      },
    });
  }

  async removeTeam({
    board_id,
    team_id,
    user_id,
  }: {
    board_id: string;
    team_id: string;
    user_id: string;
  }): Promise<void> {
    const team = await this.prismaService.kanbanTeam.findFirst({
      where: {
        board_id,
        team_id,
      },
    });

    if (!team) {
      throw new NotFoundException('User not in team');
    }

    const owner = await this.prismaService.kanbanTeam.findFirst({
      where: {
        board_id,
        role: KanbanRole.OWNER,
      },
    });

    if (team.role === KanbanRole.OWNER && owner.user_id === user_id) {
      throw new ForbiddenException('Owner cannot remove');
    }

    await this.prismaService.kanbanTeam.delete({
      where: {
        team_id,
      },
    });
  }

  async teamChangeOwner(
    board_id: string,
    team_id: string,
    user: User,
  ): Promise<KanbanTeamModel> {
    const userTeam = await this.prismaService.kanbanTeam.findFirst({
      where: {
        board_id,
        User: {
          user_id: user.user_id,
        },
      },
    });

    if (!userTeam || userTeam.role !== KanbanRole.OWNER) {
      throw new ForbiddenException('Permission denied');
    }

    const team = await this.prismaService.kanbanTeam.findFirst({
      where: {
        board_id,
        team_id,
      },
    });

    if (!team) {
      throw new NotFoundException('User not in team');
    }

    const updatedTeam = await this.prismaService.kanbanTeam.update({
      where: {
        team_id: team.team_id,
      },
      data: {
        role: KanbanRole.OWNER,
      },
      include: {
        User: true,
      },
    });

    await this.prismaService.kanbanTeam.update({
      where: {
        team_id: userTeam.team_id,
      },
      data: {
        role: KanbanRole.ADMIN,
      },
    });

    return await KanbanTeamModel.toJson(updatedTeam);
  }

  async teamChangeRole(request: ChangeRoleRequest): Promise<KanbanTeamModel> {
    const ValidatedRequest = this.validationService.validate(
      BoardValidation.CHANGE_ROLE_REQUEST,
      request,
    );

    const { board_id, team_id, role, user_id } = ValidatedRequest;
    const userTeam = await this.prismaService.kanbanTeam.findFirst({
      where: {
        board_id,
        User: {
          user_id: user_id,
        },
      },
    });

    if (!userTeam || userTeam.role !== KanbanRole.OWNER) {
      throw new ForbiddenException('Permission denied');
    }

    const team = await this.prismaService.kanbanTeam.findFirst({
      where: {
        board_id,
        team_id,
      },
    });

    if (!team) {
      throw new NotFoundException('User not in team');
    }

    const updatedTeam = await this.prismaService.kanbanTeam.update({
      where: {
        team_id: team.team_id,
      },
      data: {
        role,
        permission:
          role === KanbanRole.ADMIN ? AccessType.EDIT : AccessType.VIEW,
      },
      include: {
        User: true,
      },
    });

    return await KanbanTeamModel.toJson(updatedTeam);
  }
}
