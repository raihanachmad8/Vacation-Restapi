import { ReplyModel } from './replies.model';
import { UserModel } from './user';

export class CommentModel {
  comment_id: number;
  comment: string;
  marked_like?: boolean = false;
  count_like?: number = 0;
  user: UserModel;
  replies?: ReplyModel[];
  created_at: Date;
  updated_at: Date;

  static async toJson(
    partial: Partial<any>,
    marked_user_id?: string,
  ): Promise<CommentModel> {
    const comment = new CommentModel();
    const childReplies = partial.ArticleCommentReply?.ChildReplies
      ? await Promise.all(
          partial.ArticleCommentReply.ChildReplies.map((r: any) =>
            ReplyModel.toJson(r, marked_user_id),
          ),
        )
      : [];

    const replies = partial.ArticleCommentReply
      ? await Promise.all(
          partial.ArticleCommentReply.map((r: any) =>
            ReplyModel.toJson(r, marked_user_id),
          ),
        )
      : [];

    partial.comment_id && (comment.comment_id = partial.comment_id);
    partial.comment && (comment.comment = partial.comment);
    partial.ArticleCommentLike &&
      (comment.marked_like = partial.ArticleCommentLike.some(
        (like: any) => like.user_id === marked_user_id,
      ));
    partial.ArticleCommentLike &&
      (comment.count_like = partial.ArticleCommentLike.length);
    partial.User && (comment.user = await UserModel.toJson(partial.User));
    comment.replies = [...replies, ...childReplies];
    partial.created_at && (comment.created_at = partial.created_at);
    partial.updated_at && (comment.updated_at = partial.updated_at);
    return comment;
  }
}
