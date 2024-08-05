import { LoginRequest, RegisterRequest } from './dto';
import { z, ZodType } from 'zod';

export class AuthValidation {
  static readonly REGISTER_REQUEST: ZodType<RegisterRequest> = z.object({
    fullname: z.string().min(3),
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(5),
  }) as ZodType<RegisterRequest>;

  static readonly LOGIN_REQUEST: ZodType<LoginRequest> = z.object({
    email: z.string().email(),
    password: z.string().min(5),
  }) as ZodType<LoginRequest>;
}
