import { Role } from '@prisma/client';
import { generateFileUrl } from '@src/common/utils';
import { profileStorageConfig } from '@root/config/storage.config';

export class UserModel {
  user_id: string;
  fullname: string;
  email: string;
  username: string;
  role?: Role;
  profile: string;
  created_at?: Date;
  updated_at?: Date;

  static async toJson(partial: Partial<UserModel>): Promise<UserModel> {
    const user = new UserModel();
    partial.user_id && (user.user_id = partial.user_id);
    partial.fullname && (user.fullname = partial.fullname);
    partial.email && (user.email = partial.email);
    partial.username && (user.username = partial.username);
    partial.role && (user.role = partial.role);
    partial.profile && (user.profile = partial.profile);
    partial.created_at && (user.created_at = partial.created_at);
    partial.updated_at && (user.updated_at = partial.updated_at);
    (partial.profile &&
      (user.profile = await generateFileUrl(
        partial.profile,
        profileStorageConfig,
      ))) ||
      '';
    return user;
  }
}
