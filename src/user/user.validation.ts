import { UpdateUserRequest } from './dto';
import { z, ZodType } from 'zod';
import { UserFilter } from './types';

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

export class UserValidation {
  static readonly UPDATE_USER_REQUEST: ZodType<UpdateUserRequest> = z.object({
    user_id: z.string().uuid(),
    fullname: z.string().min(3).optional(),
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    profile: MulterFileSchema.optional(),
  }) as ZodType<UpdateUserRequest>;

  static readonly USER_ID: ZodType = z.string().uuid();

  static readonly USER_FILTER: ZodType<UserFilter> = z.object({
    s: z.string().optional(),
    username: z.string().optional(),
    email: z.string().optional(),
    fullname: z.string().optional(),
    limit: z.number().int().positive().optional(),
    page: z.number().int().positive().optional(),
    orderBy: z.string().optional(),
    order: z.string().optional(),
  }) as ZodType<UserFilter>;
}
