import { Role } from '@prisma/client';

export class User {
  user_id: string;
  fullname: string;
  email: string;
  username: string;
  role?: Role;
  profile: string;
  created_at?: Date;
  updated_at?: Date;
}
