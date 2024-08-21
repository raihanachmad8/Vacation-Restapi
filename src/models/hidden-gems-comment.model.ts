import { HiddenGemsCommentRepliesModel } from './hidden-gems-comment-replies.model';
import { UserModel } from './user';

export class HiddenGemsCommentModel {
  comment_id: string;
  comment: string;
  hidden_gems_id: string;
  rating: number;
  user: UserModel;
  // user_rating: number;
  replies?: HiddenGemsCommentRepliesModel[];
  created_at: Date;
  updated_at: Date;

  static async toJson(partial: Partial<any>): Promise<HiddenGemsCommentModel> {
    console.log(partial.HiddenGemsRating);
    partial.HiddenGemsRating &&
      (partial.rating =
        partial.HiddenGemsRating.find(
          (rating: any) => rating.comment_id === partial.comment_id,
        ).rating || 0);
    const comment = new HiddenGemsCommentModel();
    const childReplies = partial.HiddenGemsReply?.ChildReplies
      ? await Promise.all(
          partial.HiddenGemsReply.ChildReplies.map((r: any) =>
            HiddenGemsCommentRepliesModel.toJson(r),
          ),
        )
      : [];

    const replies = partial.HiddenGemsReply
      ? await Promise.all(
          partial.HiddenGemsReply.map((r: any) =>
            HiddenGemsCommentRepliesModel.toJson(r),
          ),
        )
      : [];
    partial.comment_id && (comment.comment_id = partial.comment_id);
    partial.comment && (comment.comment = partial.comment);
    partial.hidden_gems_id && (comment.hidden_gems_id = partial.hidden_gems_id);
    partial.rating && (comment.rating = partial.rating);
    partial.User && (comment.user = await UserModel.toJson(partial.User));
    comment.replies = [...replies, ...childReplies];
    partial.created_at && (comment.created_at = partial.created_at);
    partial.updated_at && (comment.updated_at = partial.updated_at);
    return comment;
  }
}
