import { articleStorageConfig, generateFileUrl } from '@src/common/utils';
import { CommentModel } from './article-comment.model';
import { UserModel } from './user';
import { ar } from '@faker-js/faker';

export class ArticleModel {
  article_id: number;
  title: string;
  cover: string;
  content: string;
  status: string;
  count_views: number;
  count_likes: number;
  count_comments: number;
  count_bookmarks: number;
  marked_bookmark?: boolean = false;
  marked_like?: boolean = false;
  user: UserModel;
  tag: string[];
  comment?: Comment[];
  created_at: Date;
  updated_at: Date;

  static async toJson(
    partial: Partial<any>,
    marked_user_id?: string,
  ): Promise<ArticleModel> {
    try {
      const article = new ArticleModel();
      partial.article_id && (article.article_id = partial.article_id);
      partial.title && (article.title = partial.title);
      partial.Cover &&
        (article.cover = await generateFileUrl(
          partial.Cover.filename,
          articleStorageConfig,
        ));
      partial.content && (article.content = partial.content);
      partial.status && (article.status = partial.status);
      article.count_views = partial.count_view || 0;
      article.count_likes = partial?.ArticleLike?.length || 0;
      article.count_comments = partial?.ArticleComment?.length || 0;
      article.count_bookmarks = partial?.ArticleBookmark?.length || 0;
      partial.ArticleComment &&
        (await Promise.all(
          partial.ArticleComment.map(async (comment: any) => {
            article.count_comments += comment.ArticleCommentReply.length;
            comment.ArticleCommentReply.ChildReplies &&
              (await Promise.all(
                comment.ArticleCommentReply.ChildReplies.map(
                  async (reply: any) => {
                    article.count_comments +=
                      reply.ArticleCommentReplyLike.length;
                  },
                ),
              ));

            article.count_likes += comment.ArticleCommentLike.length;
            comment.ArticleCommentReply &&
              (await Promise.all(
                comment.ArticleCommentReply.map(async (reply: any) => {
                  article.count_likes += reply.ArticleCommentReplyLike.length;
                }),
              ));
          }),
        ));

      partial.ArticleBookmark &&
        (article.marked_bookmark = partial.ArticleBookmark.some(
          (bookmark: any) => bookmark.user_id === marked_user_id,
        ));

      partial.ArticleLike &&
        (article.marked_like = partial.ArticleLike.some(
          (like: any) => like.user_id === marked_user_id,
        ));
      partial.User &&
        (article.user = await Promise.resolve(UserModel.toJson(partial.User)));
      partial.Tag &&
        (article.tag = partial.Tag.map((tag: any) => tag.tag_name));
      partial.ArticleComment &&
        (await Promise.all(
          partial.ArticleComment.map(async (comment: any) =>
            CommentModel.toJson(comment, marked_user_id),
          ),
        ).then((comments) => (article.comment = comments) as any));
      partial.created_at && (article.created_at = partial.created_at);
      partial.updated_at && (article.updated_at = partial.updated_at);
      return article;
    } catch (error) {
      console.log(error);
    }
  }
}
