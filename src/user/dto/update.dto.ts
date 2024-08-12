export class UpdateUserRequest {
  user_id: string;
  fullname?: string;
  email?: string;
  username?: string;
  password?: string;
  profile?: Express.Multer.File;
}
