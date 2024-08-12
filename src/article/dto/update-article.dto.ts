export class UpdateArticleRequest {
  article_id: string;
  title?: string;
  content?: string;
  tags?: string[];
  user_id: string;
  file: Express.Multer.File;
}
