import { ArticleStatus } from "@prisma/client";

export class CreateArticleRequest {
  title: string;
  content: string;
  tags?: string[];
  user_id: string;
  status?: ArticleStatus;
  file: Express.Multer.File;
}
