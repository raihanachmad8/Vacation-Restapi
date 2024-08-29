import { AccessType, KanbanRole } from "@prisma/client";
import { UserModel } from "./user";

export class KanbanTeamModel {
  team_id: string;
  board_id: string;
  role: KanbanRole;
  permissions: AccessType;
  user: UserModel;
  created_at: Date;
  updated_at: Date;
  static async toJson(partial: Partial<any>): Promise<KanbanTeamModel> {
    const team = new KanbanTeamModel();
    partial.team_id && (team.team_id = partial.team_id);
    partial.board_id && (team.board_id = partial.board_id);
    partial.role && (team.role = partial.role);
    partial.permissions && (team.permissions = partial.permissions);
    partial.User && (team.user = await UserModel.toJson(partial.User));
    partial.created_at && (team.created_at = partial.created_at);
    partial.updated_at && (team.updated_at = partial.updated_at);
    return team;
  }
}
