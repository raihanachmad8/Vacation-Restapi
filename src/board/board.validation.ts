import { z, ZodType } from 'zod';
import {
  ChangeRoleRequest,
  CreateBoardRequest,
  CreateCardKanbanRequest,
  JoinTeamRequest,
} from './dto';
import { BoardFilter } from './types';
import { UpdateBoardRequest } from './dto/update.dto';
import { UpdateCardKanbanRequest } from './dto/update-card.dto';
import { InviteTeamRequest } from './dto/invite-team.dto';

const MulterFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string().regex(/\.(jpg|jpeg|png)$/i),
  encoding: z.string(),
  mimetype: z.string(),
  buffer: z.instanceof(Buffer),
  size: z.number().max(5 * 1024 * 1024), // 5MB
  stream: z.any().optional(),
  destination: z.string().optional(),
  filename: z.string().optional(),
  path: z.string().optional(),
});

export class BoardValidation {
  static readonly CREATE_BOARD_REQUEST: ZodType<CreateBoardRequest> = z.object({
    cover: MulterFileSchema.optional(),
    title: z.string().min(3),
    user_id: z.string().uuid(),
  }) as ZodType<CreateBoardRequest>;

  static readonly BOARD_FILTER: ZodType<BoardFilter> = z.object({
    s: z.string().optional(),
    limit: z.number().int().optional(),
    page: z.number().int().optional(),
    orderBy: z.string().optional(),
    order: z.string().optional(),
  }) as ZodType<BoardFilter>;

  static readonly CREATE_CARD_KANBAN_REQUEST: ZodType<CreateCardKanbanRequest> =
    z.object({
      board_id: z.string().uuid(),
      cover: MulterFileSchema.optional(),
      title: z.string().min(3),
      description: z.string().min(10).optional(),
      status: z.enum(['TODO', 'DOING', 'DONE']).optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
      members: z
        .array(
          z.object({
            team_id: z.string().uuid(),
          }),
        )
        .optional(),
      tasklist: z
        .array(
          z.object({
            task_list_id: z.string().uuid().optional(),
            task: z.string().min(3),
            is_done: z.boolean(),
          }),
        )
        .optional(),
      user_id: z.string().uuid(),
    }) as ZodType<CreateCardKanbanRequest>;

  static readonly BOARD_TEAM_FILTER: ZodType<{
    board_id: string;
    user_id: string;
    username?: string;
  }> = z.object({
    board_id: z.string().uuid(),
    user_id: z.string().uuid(),
    username: z.string().optional(),
  }) as ZodType<{ board_id: string; username?: string; user_id: string }>;

  static readonly UPDATE_BOARD_REQUEST: ZodType<UpdateBoardRequest> = z.object({
    board_id: z.string().uuid(),
    cover: MulterFileSchema.optional(),
    title: z.string().min(3).optional(),
    user_id: z.string().uuid(),
  }) as ZodType<UpdateBoardRequest>;

  static readonly UPDATE_CARD_KANBAN_REQUEST: ZodType<UpdateCardKanbanRequest> =
    z.object({
      board_id: z.string().uuid(),
      cover: MulterFileSchema.optional(),
      card_id: z.string().uuid(),
      title: z.string().min(3).optional(),
      description: z.string().min(10).optional(),
      status: z.enum(['TODO', 'DOING', 'DONE']).optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
      members: z
        .array(
          z.object({
            team_id: z.string().uuid(),
          }),
        )
        .optional(),
      tasklist: z
        .array(
          z.object({
            task_list_id: z.string().uuid().optional(),
            task: z.string().min(3),
            is_done: z.boolean(),
          }),
        )
        .optional(),
      user_id: z.string().uuid(),
    }) as ZodType<UpdateCardKanbanRequest>;

  static readonly INVITE_TEAM_REQUEST: ZodType<InviteTeamRequest> = z.object({
    board_id: z.string().uuid(),
    username: z.string().min(3),
  }) as ZodType<InviteTeamRequest>;

  static readonly JOIN_TEAM_REQUEST: ZodType<JoinTeamRequest> = z.object({
    board_id: z.string().uuid(),
    hashed: z.string().min(3),
    user_id: z.string().uuid(),
  }) as ZodType<JoinTeamRequest>;

  static readonly CHANGE_ROLE_REQUEST: ZodType<ChangeRoleRequest> = z.object({
    board_id: z.string().uuid(),
    team_id: z.string().uuid(),
    role: z.enum(['ADMIN', 'MEMBER']),
    user_id: z.string().uuid(),
  }) as ZodType<ChangeRoleRequest>;
}
