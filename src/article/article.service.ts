import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { articleFilter } from './types';
import { ArticleModel, Paging } from 'src/models';
import {
  deleteFile,
  generateRandomFileName,
  uploadFile,
} from 'src/common/utils/file-storage';
import { FileStorageOptions } from 'src/file-storage/types';
import { Status, Role } from '@prisma/client';
import { articleStorageConfig } from 'src/common/utils';
import { commentDto } from './dto/comment.dto';
import { Comment } from 'src/models/comment';
import { Reply } from 'src/models/replies';

@Injectable()
export class ArticleService {
  private readonly articleStorageConfig: FileStorageOptions =
    articleStorageConfig;

  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateArticleDto, file: Express.Multer.File) {
    const { tags, user_id, ...articleData } = dto;
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

  async search(query: articleFilter): Promise<{
    paging: Paging;
    data: ArticleModel | ArticleModel[];
  }> {
    const { u, stat, s, limit, page, orderBy, order } = query;
    const take = limit ? Math.min(parseInt(limit, 10), 25) : 10;
    const skip = page ? (parseInt(page, 10) - 1) * take : 0;
    const orderConfig = orderBy ? { [orderBy]: order || 'asc' } : undefined;

    const statusValues: Status[] = stat
      ? stat
          .split(',')
          .map((status) => status.trim().toUpperCase())
          .filter((status): status is keyof typeof Status =>
            Object.values(Status).includes(status as Status),
          )
          .map((status) => Status[status as keyof typeof Status])
      : ['APPROVE'];

    const whereConditions = {
      ...(s && {
        OR: [{ title: { contains: s } }, { content: { contains: s } }],
      }),
      ...(u && { user_id: u }),
      ...(stat && {
        status: {
          in: statusValues,
        },
      }),
    };

    const total = await this.prismaService.article.count({
      where: whereConditions,
    });

    const include = {
      User: true,
      Tag: true,
      Cover: true,
    };

    const articles = await this.prismaService.article.findMany({
      where: whereConditions,
      take,
      skip,
      orderBy: orderConfig,
      include: include,
    });

    const paging: Paging = {
      current_page: page ? parseInt(page, 10) : 1,
      first_page: 1,
      last_page: Math.ceil(total / take),
      total,
    };

    return {
      paging,
      data: await Promise.all(articles.map(ArticleModel.toJson)),
    };
  }

  async find(
    id: string,
    user_id?: string,
  ): Promise<ArticleModel | ArticleModel[]> {
    const include = {
      User: true,
      Tag: true,
      Cover: true,
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
    };

    if (user_id) {
      include['ArticleLike'] = {
        where: {
          user_id,
        },
      };
      include['ArticleBookmark'] = {
        where: {
          user_id,
        },
      };
    }
    const article = await this.prismaService.article.findUnique({
      where: { article_id: id },
      include: include,
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    await this.prismaService.article.update({
      where: { article_id: id },
      data: { count_view: article.count_view + 1 },
    });

    return await ArticleModel.toJson(article);
  }

  async update(id: string, dto: UpdateArticleDto, file?: Express.Multer.File) {
    const { tags, user_id, ...articleData } = dto;
    const article = await this.prismaService.article.findUnique({
      where: { article_id: id },
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
            where: { article_id: id },
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

  async getBookmark(user_id: string) {
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
        ArticleComment: {
          include: {
            User: true,
          },
        },
        ArticleLike: true,
        ArticleBookmark: true,
      },
    });

    if (!article) {
      return [];
    }

    return await ArticleModel.toJson(article);
  }

  async comment(article_id: string, user_id: string, comment: commentDto) {
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

      return await Comment.toJson(newComment);
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
        // Create a new like
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
    commentDto: commentDto,
  ) {
    const parentComment = await this.prismaService.articleComment.findUnique({
      where: { comment_id },
    });

    if (!parentComment) {
      throw new NotFoundException('Comment not found');
    }

    const reply = await this.prismaService.articleCommentReply.create({
      data: {
        ...commentDto,
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

    return await Reply.toJson(reply);
  }

  async replyReply(
    article_id: string,
    comment_id: string,
    reply_id: string,
    user_id: string,
    commentDto: commentDto,
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
        ...commentDto,
        user_id,
        comment_id,
        parent_id: reply_id,
      },
    });

    return await Reply.toJson(reply);
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
