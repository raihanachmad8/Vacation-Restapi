import { KanbanTeamModel } from './kanban-team.model';

export class KanbanMemberModel {
  member_id: string;
  team: KanbanTeamModel;
  created_at: Date;
  updated_at: Date;

  static async toJson(partial: Partial<any>): Promise<KanbanMemberModel> {
    const member = new KanbanMemberModel();
    partial.member_id && (member.member_id = partial.member_id);
    partial.KanbanTeam &&
      (member.team = await KanbanTeamModel.toJson(partial.KanbanTeam));
    return member;
    partial.created_at && (member.created_at = partial.created_at);
    partial.updated_at && (member.updated_at = partial.updated_at);
  }
}
