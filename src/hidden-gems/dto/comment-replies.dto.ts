export class HiddenGemsCommentRepliesRequest {
  hidden_gems_id: string;
  comment_id: string;
  parent_id?: string;
  comment: string;
  rating: number;
  user_id: string;
}
