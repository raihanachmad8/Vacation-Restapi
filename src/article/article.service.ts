import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { articleFilter } from './types';
import { ArticleModel, Paging } from '@src/models';
import {
  deleteFile,
  generateRandomFileName,
  uploadFile,
} from '@src/common/utils/file-storage';
import { FileStorageOptions } from '@src/file-storage/types';
import { Status, Role, User } from '@prisma/client';
import { articleStorageConfig } from '@src/common/utils';
import { CommentRequest } from './dto';
import { CommentModel } from '@src/models/article-comment.model';
import { ReplyModel } from '@src/models/article-comment-replies.model';
import { ValidationService } from '@src/common/validation.service';
import { ArticleValidation } from './article.validation';
import { CreateArticleRequest, UpdateArticleRequest } from './dto';

@Injectable()
export class ArticleService {
  private readonly articleStorageConfig: FileStorageOptions =
    articleStorageConfig;

  constructor(
    private readonly prismaService: PrismaService,
    private validateService: ValidationService,
  ) {}

  async create(request: CreateArticleRequest) {
    const CreateArticleRequest = this.validateService.validate(
      ArticleValidation.CREATE_ARTICLE_REQUEST,
      request,
    );
    const { tags, user_id, file, ...articleData } = CreateArticleRequest;
    const coverFileName = await generateRandomFileName(file);

    try {
      const transaction = await this.prismaService.$transaction(
        async (prisma) => {
          const tagOperations = tags?.map((tag) =>
            prisma.tag.upsert({
              where: { tag_name: tag },
              update: {},
              create: { tag_name: tag },
            }),
          );

          const tagResults = await Promise.all(tagOperations || []);
          const tagNames = tagResults.map((tag) => tag.tag_name);

          const coverFile = await prisma.file.create({
            data: {
              filename: coverFileName,
              visibility: this.articleStorageConfig.visibility,
              user_id,
            },
          });

          const article = await prisma.article.create({
            data: {
              ...articleData,
              User: { connect: { user_id } },
              Cover: { connect: { id: coverFile.id } },
              Tag: {
                connect: tagNames.map((tagName) => ({ tag_name: tagName })),
              },
            },
            include: {
              User: true,
              Tag: true,
              Cover: true,
              ArticleComment: true,
              ArticleLike: true,
            },
          });

          return article;
        },
      );

      if (file) {
        await uploadFile(file, this.articleStorageConfig, coverFileName);
      }
      return await ArticleModel.toJson(transaction);
    } catch (error) {
      try {
        const deleteMessage = await deleteFile(
          coverFileName,
          this.articleStorageConfig,
        );
        console.error(deleteMessage);
      } catch (error) {
        console.error(error.message);
      }
      throw new InternalServerErrorException(
        `Error creating article: ${error.message}`,
      );
    }
  }

  async search(
    query: articleFilter,
    user?: User,
  ): Promise<{
    paging: Paging;
    data: ArticleModel[];
  }> {
    const validatedQuery = this.validateService.validate(
      ArticleValidation.ARTICLE_FILTER,
      query,
    );

    const {
      u,
      stat,
      s,
      limit = 10,
      page = 1,
      orderBy = 'updated_at',
      order = 'desc',
    } = validatedQuery;
    const take = Math.min(limit, 25);
    const skip = (page - 1) * take;
    const orderConfig = orderBy ? { [orderBy]: order } : undefined;

    let status: Status[] = [Status.APPROVE];
    if (user) {
      if (user.role === Role.ADMIN) {
        status = (stat as Status[]) || [
          Status.APPROVE,
          Status.PENDING,
          Status.REJECT,
          Status.REVISION,
        ];
      } else {
        if (u) {
          const userBody = await this.prismaService.user.findUnique({
            where: { user_id: u },
          });

          if (!userBody) {
            throw new NotFoundException('User not found');
          }

          status =
            userBody.user_id === user.user_id
              ? (stat as Status[]) || [
                  Status.APPROVE,
                  Status.PENDING,
                  Status.REJECT,
                  Status.REVISION,
                ]
              : [Status.APPROVE];
        } else {
          status = [Status.APPROVE];
        }
      }
    }

    const whereConditions = {
      ...(s && {
        OR: [{ title: { contains: s } }, { content: { contains: s } }],
      }),
      ...(u ? { User: { user_id: u } } : {}),
      ...(status.length > 0 ? { status: { in: status } } : {}),
    };

    const include = {
      User: true,
      Tag: true,
      Cover: true,
      ArticleLike: true,
      ArticleComment: {
        include: {
          User: true,
          ArticleCommentLike: true,
          ArticleCommentReply: {
            include: {
              User: true,
              ArticleCommentReplyLike: true,
              ChildReplies: {
                include: {
                  User: true,
                  ArticleCommentReplyLike: true,
                },
              },
            },
          },
        },
      },
      ArticleBookmark: true,
    };

    const [articles, total] = await this.prismaService.$transaction([
      this.prismaService.article.findMany({
        where: whereConditions,
        take,
        skip,
        orderBy: orderConfig,
        include: include,
      }),
      this.prismaService.article.count({
        where: whereConditions,
      }),
    ]);

    const paging: Paging = {
      current_page: page || 1,
      first_page: 1,
      last_page: Math.ceil(total / take),
      total,
    };

    const data = await Promise.all(
      articles.map(async (article) => {
        const {  ...articleData } = await ArticleModel.toJson(
          article,
          user?.user_id,
        );
        return articleData;
      }),
    );

    return {
      paging,
      data,
    };
  }

  async find(article_id: string, user?: User): Promise<ArticleModel> {
    const include = {
      User: true,
      Tag: true,
      Cover: true,
      ArticleLike: true,
      ArticleComment: {
        include: {
          User: true,
          ArticleCommentLike: true,
          ArticleCommentReply: {
            include: {
              User: true,
              ArticleCommentReplyLike: true,
              ChildReplies: {
                include: {
                  User: true,
                  ArticleCommentReplyLike: true,
                },
              },
            },
          },
        },
      },
      ArticleBookmark: true,
    };

    const article = await this.prismaService.article.findUnique({
      where: { article_id },
      include: include,
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    await this.prismaService.article.update({
      where: { article_id },
      data: { count_view: article.count_view + 1 },
    });

    return await ArticleModel.toJson(article, user?.user_id);
  }

  async update(request: UpdateArticleRequest) {
    const UpdateArticleRequest = this.validateService.validate(
      ArticleValidation.ARTICLE_UPDATE_REQUEST,
      request,
    );
    const { article_id, tags, user_id, file, ...articleData } =
      UpdateArticleRequest;
    const article = await this.prismaService.article.findUnique({
      where: { article_id: article_id },
      include: { User: true, Cover: true, Tag: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.User.user_id !== user_id) {
      throw new ForbiddenException(
        'You are not authorized to update this article',
      );
    }

    const coverFileName = file
      ? await generateRandomFileName(file)
      : article.Cover.filename;

    try {
      const transaction = await this.prismaService.$transaction(
        async (prisma) => {
          const currentTags = article.Tag.map((tag) => tag.tag_name);
          const tagsToConnect = tags.filter(
            (tag) => !currentTags.includes(tag),
          );
          const tagsToDisconnect = currentTags.filter(
            (tag) => !tags.includes(tag),
          );
          const tagUpserts = tagsToConnect.map((tag) =>
            prisma.tag.upsert({
              where: { tag_name: tag },
              update: {},
              create: { tag_name: tag },
            }),
          );
          await Promise.all(tagUpserts);

          const newCover = file
            ? await prisma.file.create({
                data: {
                  filename: coverFileName,
                  visibility: this.articleStorageConfig.visibility,
                  user_id,
                },
              })
            : null;

          let articleStatus = article.status;

          switch (articleStatus) {
            case Status.REJECT:
              articleStatus = Status.PENDING;
              break;
            case 'REVISION':
              articleStatus = Status.PENDING;
              break;
            default:
              articleStatus = article.status;
              break;
          }

          const updatedArticle = await prisma.article.update({
            where: { article_id: article_id },
            data: {
              ...articleData,
              status: articleStatus,
              User: { connect: { user_id } },
              Tag: {
                connect: tagsToConnect.map((tag) => ({ tag_name: tag })),
                disconnect: tagsToDisconnect.map((tag) => ({ tag_name: tag })),
              },
              Cover: newCover
                ? { connect: { id: newCover.id } }
                : { connect: { id: article.Cover.id } },
            },
            include: {
              User: true,
              Tag: true,
              Cover: true,
              ArticleComment: {
                include: {
                  User: true,
                },
              },
              ArticleLike: true,
            },
          });

          return updatedArticle;
        },
      );

      if (file) {
        await uploadFile(file, this.articleStorageConfig, coverFileName);
        await deleteFile(article.Cover.filename, this.articleStorageConfig);
      }

      return await ArticleModel.toJson(transaction);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating article: ${error.message}`,
      );
    }
  }

  async delete(id: string, user_id: string): Promise<string> {
    const article = await this.prismaService.article.findUnique({
      where: { article_id: id },
      include: { Cover: true, User: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.User.user_id !== user_id) {
      throw new ForbiddenException(
        'You are not authorized to delete this article',
      );
    }

    const filename = article.Cover?.filename || null;

    try {
      await this.prismaService.$transaction(async (prisma) => {
        await prisma.article.delete({
          where: { article_id: id },
        });

        if (filename) {
          await deleteFile(filename, this.articleStorageConfig);
        }
      });

      return `Article ${id} deleted successfully`;
    } catch (error) {
      console.error(`Error in delete operation: ${error.message}`);
      throw new InternalServerErrorException(
        `Error deleting article: ${error.message}`,
      );
    }
  }

  async changeStatus(id: string, status: Status, user_id: string) {
    const article = await this.prismaService.article.findUnique({
      where: { article_id: id },
      include: { User: true, Tag: true, Cover: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const user = await this.prismaService.user.findUnique({
      where: { user_id },
    });

    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You are not authorized to update this article',
      );
    }

    try {
      const transaction = await this.prismaService.$transaction(
        async (prisma) => {
          const updatedArticle = await prisma.article.update({
            where: { article_id: id },
            data: { status },
            include: { User: true, Tag: true, Cover: true },
          });

          return updatedArticle;
        },
      );

      return await ArticleModel.toJson(transaction);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating article: ${error.message}`,
      );
    }
  }

  async like(article_id: string, user_id: string) {
    const article = await this.prismaService.article.findUnique({
      where: { article_id },
      include: { ArticleLike: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const userLike = article.ArticleLike.find(
      (like) => like.user_id === user_id,
    );

    try {
      if (userLike) {
        await this.prismaService.articleLike.delete({
          where: {
            article_id_user_id: {
              article_id,
              user_id,
            },
          },
        });

        return {
          marked_like: false,
        };
      } else {
        await this.prismaService.articleLike.create({
          data: {
            article_id,
            user_id,
          },
        });

        return {
          marked_like: true,
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Error liking article: ${error.message}`,
      );
    }
  }

  async bookmark(article_id: string, user_id: string) {
    const article = await this.prismaService.article.findUnique({
      where: { article_id },
      include: { User: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const user = await this.prismaService.user.findUnique({
      where: { user_id },
      include: { ArticleBookmark: true },
    });

    const isArticleBookmarked = user.ArticleBookmark.some(
      (bookmark) => bookmark.article_id === article_id,
    );

    try {
      if (isArticleBookmarked) {
        await this.prismaService.articleBookmark.delete({
          where: {
            article_id_user_id: {
              article_id,
              user_id,
            },
          },
        });

        return {
          marked_bookmark: false,
        };
      } else {
        await this.prismaService.articleBookmark.create({
          data: {
            article_id,
            user_id,
          },
        });

        return {
          marked_bookmark: true,
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Error bookmarking article: ${error.message}`,
      );
    }
  }

  async getBookmark(user_id: string): Promise<ArticleModel[]> {
    const article = await this.prismaService.article.findMany({
      where: {
        ArticleBookmark: {
          some: {
            user_id,
          },
        },
      },
      include: {
        User: true,
        Tag: true,
        Cover: true,
      },
    });

    if (!article) {
      return [];
    }

    return await Promise.all(
      article.map((article) => ArticleModel.toJson(article)),
    );
  }

  async comment(article_id: string, user_id: string, comment: CommentRequest) {
    const article = await this.prismaService.article.findUnique({
      where: { article_id },
      include: { ArticleComment: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    try {
      const newComment = await this.prismaService.articleComment.create({
        data: {
          article_id,
          user_id,
          ...comment,
        },

        include: {
          User: true,
        },
      });

      return await CommentModel.toJson(newComment);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error commenting article: ${error.message}`,
      );
    }
  }

  async likeComment(article_id: string, comment_id: string, user_id: string) {
    try {
      const comment = await this.prismaService.articleComment.findUnique({
        where: { comment_id },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      const existingLike =
        await this.prismaService.articleCommentLike.findUnique({
          where: { comment_id_user_id: { comment_id, user_id } },
        });

      if (existingLike) {
        await this.prismaService.articleCommentLike.delete({
          where: { comment_id_user_id: { comment_id, user_id } },
        });
        return {
          marked_like: false,
        };
      } else {
        await this.prismaService.articleCommentLike.create({
          data: { comment_id, user_id },
        });
        return {
          marked_like: true,
        };
      }
    } catch (error) {
      console.error('Error in likeComment:', error);
      throw new InternalServerErrorException(
        'Failed to like/unlike the comment',
      );
    }
  }

  async replyComment(
    article_id: string,
    comment_id: string,
    user_id: string,
    comment: CommentRequest,
  ) {
    const parentComment = await this.prismaService.articleComment.findUnique({
      where: { comment_id },
    });

    if (!parentComment) {
      throw new NotFoundException('Comment not found');
    }

    const reply = await this.prismaService.articleCommentReply.create({
      data: {
        ...comment,
        user_id,
        comment_id,
      },
      include: {
        User: true,
        ChildReplies: {
          include: {
            User: true,
          },
        },
      },
    });

    return await ReplyModel.toJson(reply);
  }

  async replyReply(
    article_id: string,
    comment_id: string,
    reply_id: string,
    user_id: string,
    comment: CommentRequest,
  ) {
    const parentReply = await this.prismaService.articleCommentReply.findUnique(
      {
        where: { reply_id },
      },
    );

    if (!parentReply) {
      throw new NotFoundException('Reply not found');
    }

    const reply = await this.prismaService.articleCommentReply.create({
      data: {
        ...comment,
        user_id,
        comment_id,
        parent_id: reply_id,
      },
    });

    return await ReplyModel.toJson(reply);
  }

  async likeReply(
    article_id: string,
    comment_id: string,
    reply_id: string,
    user_id: string,
  ) {
    try {
      const reply = await this.prismaService.articleCommentReply.findUnique({
        where: { reply_id },
      });

      if (!reply) {
        throw new NotFoundException('Reply not found');
      }

      const existingLike =
        await this.prismaService.articleCommentReplyLike.findUnique({
          where: { reply_id_user_id: { reply_id, user_id } },
        });

      if (existingLike) {
        await this.prismaService.articleCommentReplyLike.delete({
          where: { reply_id_user_id: { reply_id, user_id } },
        });

        return {
          marked_like: false,
        };
      }

      await this.prismaService.articleCommentReplyLike.create({
        data: { reply_id, user_id },
      });

      return {
        marked_like: true,
      };
    } catch (error) {
      console.error('Error in likeReply:', error);
      throw new InternalServerErrorException('Failed to like/unlike the reply');
    }
  }
}
