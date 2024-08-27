import { KanbanPriority, KanbanStatus, KanbanTaskList } from '@prisma/client';
import { KanbanMemberModel } from './kanban-member.model';
import { generateFileUrl } from '../common/utils';
import { kanbanCardStorageConfig } from '@root/config/storage.config';

export class KanbanCardModel {
  card_id: string;
  board_id: string;
  cover: string = '';
  title: string;
  description: string;
  status: KanbanStatus;
  priority: KanbanPriority;
  tasklist: KanbanTaskList[];
  member: KanbanMemberModel[];
  created_at: Date;
  updated_at: Date;

  static async toJson(partial: Partial<any>): Promise<KanbanCardModel> {
    const card = new KanbanCardModel();
    partial.Cover &&
      (card.cover = await generateFileUrl(
        partial.Cover.filename,
        kanbanCardStorageConfig,
      ));
    partial.card_id && (card.card_id = partial.card_id);
    partial.card_id && (card.board_id = partial.board_id);
    partial.title && (card.title = partial.title);
    partial.description && (card.description = partial.description);
    partial.status && (card.status = partial.status);
    partial.priority && (card.priority = partial.priority);
    partial.KanbanTaskList && (card.tasklist = partial.KanbanTaskList);
    partial.KanbanMember &&
      (card.member = await Promise.all(
        partial.KanbanMember.map(async (member) => {
          return await KanbanMemberModel.toJson(member);
        }),
      ));

    partial.created_at && (card.created_at = partial.created_at);
    partial.updated_at && (card.updated_at = partial.updated_at);
    return card;
  }
}
