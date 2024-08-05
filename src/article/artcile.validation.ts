import { CreateArticleRequest, UpdateArticleRequest } from './dto';
import { z, ZodType } from 'zod';

export class ArticleValidation {
  static readonly CREATE_ARTICLE_REQUEST: ZodType<CreateArticleRequest> =
    z.object({
      title: z.string().min(3),
      content: z.string().min(10),
      tags: z.array(z.string().min(3)).optional(),
      user_id: z.string().uuid(),
    }) as ZodType<CreateArticleRequest>;

  static readonly ARTICLE_UPDATE_REQUEST: ZodType<UpdateArticleRequest> =
    z.object({
      title: z.string().min(3).optional(),
      content: z.string().min(10).optional(),
      tags: z.array(z.string().min(3)).optional(),
      user_id: z.string().uuid(),
    }) as ZodType<UpdateArticleRequest>;

  static readonly ARTICLE_ID: ZodType = z.string().uuid();
}
