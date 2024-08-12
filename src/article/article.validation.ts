import { CreateArticleRequest, UpdateArticleRequest } from './dto';
import { z, ZodType } from 'zod';
import { articleFilter } from './types';

const MulterFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string().regex(/\.(jpg|jpeg|png)$/i),
  encoding: z.string(),
  mimetype: z.string(),
  buffer: z.instanceof(Buffer),
  size: z.number().max(5 * 1024 * 1024), // 5MB
  stream: z.any().optional(),
  destination: z.string().optional(),
  filename: z.string().optional(),
  path: z.string().optional(),
});

export class ArticleValidation {
  static readonly CREATE_ARTICLE_REQUEST: ZodType<CreateArticleRequest> =
    z.object({
      title: z.string().min(3),
      content: z.string().min(10),
      tags: z.array(z.string().min(3)).optional(),
      user_id: z.string().uuid(),
      file: MulterFileSchema,
    }) as ZodType<CreateArticleRequest>;

  static readonly ARTICLE_FILTER: ZodType<articleFilter> = z.object({
    u: z.string().uuid().optional(),
    stat: z
      .array(z.enum(['APPROVE', 'PENDING', 'REJECT', 'REVISION']))
      .optional(),
    // s: z.string().optional(),
    limit: z.number().int().optional(),
    page: z.number().int().optional(),
    orderBy: z.string().optional(),
    order: z.string().optional(),
  }) as ZodType<articleFilter>;

  static readonly ARTICLE_UPDATE_REQUEST: ZodType<UpdateArticleRequest> =
    z.object({
      article_id: z.string().uuid(),
      title: z.string().min(3).optional(),
      content: z.string().min(10).optional(),
      tags: z.array(z.string().min(3)).optional(),
      user_id: z.string().uuid(),
      file: MulterFileSchema.optional(),
    }) as ZodType<UpdateArticleRequest>;

  static readonly ARTICLE_ID: ZodType = z.string().uuid();
}
