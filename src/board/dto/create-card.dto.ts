import { KanbanPriority, KanbanStatus } from '@prisma/client';
import { KanbanMember } from '../types/member.type';
import { TaskList } from '../types';

export class CreateCardKanbanRequest {
  board_id: string;
  title: string;
  description?: string;
  priority?: KanbanPriority;
  status?: KanbanStatus;
  members?: KanbanMember[];
  tasklist?: TaskList[];
  user_id: string;
}
