import { Comment } from './comment';
import { User } from './user';
export class ArticleModel<T extends User> {
  article_id: number;
  title: string;
  cover: string;
  content: string;
  status: string;
  count_views: number;
  count_likes: number;
  marked_bookmark?: boolean;
  marked_like?: boolean;
  user: T;
  tag: string[];
  comment?: Comment[];
  created_at: Date;
  updated_at: Date;
}
