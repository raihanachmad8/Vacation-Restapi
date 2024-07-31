import { User } from "./user";

export class Reply {
  reply_id: number;
  parent_id: number;
  comment: string;
  count_like?: number;
  user: User;
  created_at: Date;
  updated_at: Date;
}
