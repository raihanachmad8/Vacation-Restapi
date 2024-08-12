import { UserModel } from './user';

export class ReplyModel {
  reply_id: number;
  parent_id: number;
  comment: string;
  count_like?: number = 0;
  marked_like?: boolean = false;
  user: UserModel;
  created_at: Date;
  updated_at: Date;

  static async toJson(
    partial: Partial<any>,
    marked_user_id?: string,
  ): Promise<ReplyModel> {
    const reply = new ReplyModel();
    partial.reply_id && (reply.reply_id = partial.reply_id);
    partial.parent_id && (reply.parent_id = partial.parent_id);
    partial.comment && (reply.comment = partial.comment);
    partial.ArticleCommentReplyLike &&
      (reply.marked_like = partial.ArticleCommentReplyLike.some(
        (like: any) => like.user_id === marked_user_id,
      )) &&
      (reply.count_like = partial.ArticleCommentReplyLike.length);
    partial.ArticleCommentReplyLike &&
      (reply.count_like = partial.ArticleCommentReplyLike.length);
    partial.User && (reply.user = await UserModel.toJson(partial.User));
    partial.created_at && (reply.created_at = partial.created_at);
    partial.updated_at && (reply.updated_at = partial.updated_at);
    return reply;
  }
}
