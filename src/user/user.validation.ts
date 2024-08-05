import { UpdateUserRequest } from './dto';
import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly UPDATE_USER_REQUEST: ZodType<UpdateUserRequest> = z.object({
    fullname: z.string().min(3).optional(),
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    profile: z.string().optional(),
  }) as ZodType<UpdateUserRequest>;

  static readonly USER_ID: ZodType = z.string().uuid();
}
