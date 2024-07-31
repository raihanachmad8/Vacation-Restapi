import { Reply } from './replies';
import { User } from './user';

export class Comment {
  comment_id: number;
  comment: string;
  marked_like?: boolean = false;
  count_like?: number = 0;
  user: User;
  replies?: Reply[];
  created_at: Date;
  updated_at: Date;

  static async toJson(partial: Partial<any>): Promise<Comment> {
    const comment = new Comment();
    const childReplies = partial.ArticleCommentReply?.ChildReplies
      ? await Promise.all(
          partial.ArticleCommentReply.ChildReplies.map((r: any) =>
            Reply.toJson(r),
          ),
        )
      : [];

    const replies = partial.ArticleCommentReply
      ? await Promise.all(
          partial.ArticleCommentReply.map((r: any) => Reply.toJson(r)),
        )
      : [];

    partial.comment_id && (comment.comment_id = partial.comment_id);
    partial.comment && (comment.comment = partial.comment);
    partial.ArticleCommentLike &&
      (comment.marked_like = partial.ArticleCommentLike.some(
        (like: any) => like.user_id === partial.User.user_id,
      )) &&
      (comment.count_like = partial.ArticleCommentLike.length);
    partial.User && (comment.user = await User.toJson(partial.User));
    comment.replies = [...replies, ...childReplies];
    partial.created_at && (comment.created_at = partial.created_at);
    partial.updated_at && (comment.updated_at = partial.updated_at);
    return comment;
  }
}
