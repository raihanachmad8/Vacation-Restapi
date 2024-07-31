import { articleStorageConfig, generateFileUrl } from 'src/common/utils';
import { Comment } from './comment';
import { User } from './user';
export class ArticleModel {
  article_id: number;
  title: string;
  cover: string;
  content: string;
  status: string;
  count_views: number;
  count_likes: number;
  marked_bookmark?: boolean;
  marked_like?: boolean;
  user: User;
  tag: string[];
  comment?: Comment[];
  created_at: Date;
  updated_at: Date;

  static async toJson(partial: Partial<any>): Promise<ArticleModel> {
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
    partial.ArticleLike && (article.count_likes = partial.ArticleLike.length);
    partial.count_view && (article.count_views = partial.count_view);
    partial.ArticleBookmark &&
      (article.marked_bookmark = partial.ArticleBookmark.some(
        (bookmark: any) => bookmark.user_id === partial.user_id,
      ));
    partial.ArticleLike &&
      (article.marked_like = partial.ArticleLike.some(
        (like: any) => like.user_id === partial.user_id,
      ));
    partial.User &&
      (article.user = await Promise.resolve(User.toJson(partial.User)));
    partial.Tag && (article.tag = partial.Tag.map((tag: any) => tag.tag_name));
    partial.ArticleComment &&
      (await Promise.all(
        partial.ArticleComment.map(async (comment: any) =>
          Comment.toJson(comment),
        ),
      ).then((comments) => (article.comment = comments) as any));
    partial.created_at && (article.created_at = partial.created_at);
    partial.updated_at && (article.updated_at = partial.updated_at);
    return article;
  }
}
