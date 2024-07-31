import { Reply } from './replies';
import { User } from './user';

export class Comment {
  comment_id: number;
  comment: string;
  count_like?: number;
  user: User;
  replies?: Reply[];
  created_at: Date;
  updated_at: Date;
}
