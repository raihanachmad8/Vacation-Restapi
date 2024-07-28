import { User } from './user';

export class ArticleModel<T extends User> {
  article_id: number;
  title: string;
  content: string;
  User: T;
  Tag: string[];
  cover: string;
  created_at: Date;
  updated_at: Date;
}
