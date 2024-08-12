export class CreateArticleRequest {
  title: string;
  content: string;
  tags?: string[];
  user_id: string;
  file: Express.Multer.File;
}
