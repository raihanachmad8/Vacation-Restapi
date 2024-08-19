import { KanbanCardModel } from './kanban-card.model';
import { KanbanTeamModel } from './kanban-team.model';
import { UserModel } from './user';

export class KanbanBoardModel {
  board_id: string;
  title: string;
  User: UserModel;
  created_at: Date;
  updated_at: Date;
  team: KanbanTeamModel[];
  kanban_card: KanbanCardModel[];

  static async toJson(partial: Partial<any>): Promise<KanbanBoardModel> {
    const board = new KanbanBoardModel();
    partial.board_id && (board.board_id = partial.board_id);
    partial.title && (board.title = partial.title);
    partial.User && (board.User = await UserModel.toJson(partial.User));
    partial.created_at && (board.created_at = partial.created_at);
    partial.updated_at && (board.updated_at = partial.updated_at);
    partial.KanbanTeam &&
      (board.team = await Promise.all(
        partial.KanbanTeam.map(async (team: any) => {
          return await KanbanTeamModel.toJson(team);
        }),
      ));
    partial.KanbanCard &&
      (board.kanban_card = await Promise.all(
        partial.KanbanCard.map(KanbanCardModel.toJson),
      ));
    return board;
  }
}
