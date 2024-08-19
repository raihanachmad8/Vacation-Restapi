import { KanbanRole } from "@prisma/client";

export class ChangeRoleRequest {
    board_id: string;
    team_id: string;
    role: KanbanRole;
    user_id: string;
}