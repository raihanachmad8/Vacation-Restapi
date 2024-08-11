import { UserModel } from './user';

export class HiddenGemsCommentRepliesModel {
  reply_id: number;
  parent_id: number;
  comment: string;
  rating: number;
  user: UserModel;
  created_at: Date;
  updated_at: Date;

  static async toJson(
    partial: Partial<any>,
  ): Promise<HiddenGemsCommentRepliesModel> {
    const reply = new HiddenGemsCommentRepliesModel();
    partial.reply_id && (reply.reply_id = partial.reply_id);
    partial.parent_id && (reply.parent_id = partial.parent_id);
    partial.comment && (reply.comment = partial.comment);
    partial.rating && (reply.rating = partial.rating);
    partial.User && (reply.user = await UserModel.toJson(partial.User));
    partial.created_at && (reply.created_at = partial.created_at);
    partial.updated_at && (reply.updated_at = partial.updated_at);
    return reply;
  }
}
