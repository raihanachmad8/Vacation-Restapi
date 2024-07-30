import { User } from "./user";

export class Comment {
  comment_id: number;
  comment: string;
  status: string;
  user: User;
  created_at: Date;
  updated_at: Date;
}
