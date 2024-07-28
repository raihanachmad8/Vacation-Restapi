import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { articleFilter } from './types';
import { ArticleModel, Paging, User } from 'src/models';
import { ConfigService } from '@nestjs/config';
import {
  deleteFile,
  generateFileUrl,
  generateRandomFileName,
  uploadFile,
} from 'src/common/utils/file-storage';
import { FileStorageOptions } from 'src/file-storage/types';
import { FileVisibility } from '@prisma/client';
import { profileStorageConfig } from 'src/common/utils';

@Injectable()
export class ArticleService {
  private readonly fileVisibility = FileVisibility.Public;
  private fileStorageOptions: FileStorageOptions = {
    visibility: this.fileVisibility,
    storageFolder: 'articles',
  };

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

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
              visibility: this.fileVisibility,
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
            include: { User: true, Tag: true, Cover: true },
          });

          return article;
        },
      );

      if (file) {
        await uploadFile(file, this.fileStorageOptions, coverFileName);
      }
      return this.transformArticle(transaction);
    } catch (error) {
      try {
        const deleteMessage = await deleteFile(
          coverFileName,
          this.fileStorageOptions,
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
    data: ArticleModel<User> | ArticleModel<User>[];
  }> {
    const { search, limit, page, orderBy, order } = query;
    const take = limit && limit > 25 ? 25 : limit || 10;
    const skip = page ? (page - 1) * take : 0;
    const orderConfig = orderBy ? { [orderBy]: order || 'asc' } : undefined;

    const whereConditions = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const total = await this.prismaService.article.count({
      where: whereConditions,
    });

    const articles = await this.prismaService.article.findMany({
      where: whereConditions,
      take,
      skip,
      orderBy: orderConfig,
      include: {
        User: {
          select: { user_id: true, username: true, email: true },
        },
        Tag: {
          select: { tag_name: true },
        },
        Cover: {
          select: { filename: true },
        },
      },
    });

    const paging: Paging = {
      current_page: page || 1,
      first_page: 1,
      last_page: Math.ceil(total / take),
      total,
    };

    return {
      paging,
      data: await this.transformArticle(articles),
    };
  }

  async find(id: string): Promise<ArticleModel<User> | ArticleModel<User>[]> {
    const article = await this.prismaService.article.findUnique({
      where: { article_id: id },
      include: { User: true, Tag: true, Cover: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.transformArticle(article);
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

          const coverFileName = file
            ? await generateRandomFileName(file)
            : article.Cover.filename;

          const newCover = file
            ? await prisma.file.create({
                data: {
                  filename: coverFileName,
                  visibility: this.fileVisibility,
                  user_id,
                },
              })
            : null;

          const updatedArticle = await prisma.article.update({
            where: { article_id: id },
            data: {
              ...articleData,
              User: { connect: { user_id } },
              Tag: {
                connect: tagsToConnect.map((tag) => ({ tag_name: tag })),
                disconnect: tagsToDisconnect.map((tag) => ({ tag_name: tag })),
              },
              Cover: newCover
                ? { connect: { id: newCover.id } }
                : { connect: { id: article.Cover.id } },
            },
            include: { User: true, Tag: true, Cover: true },
          });

          return updatedArticle;
        },
      );

      if (file) {
        await uploadFile(file, this.fileStorageOptions);
        await deleteFile(article.Cover.filename, this.fileStorageOptions);
      }

      return this.transformArticle(transaction);
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
          await deleteFile(filename, this.fileStorageOptions);
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

  private async transformArticle(
    articles: any | any[],
  ): Promise<ArticleModel<User> | ArticleModel<User>[]> {
    const appUrl = this.configService.get('APP_URL');
    if (Array.isArray(articles)) {
      return Promise.all(
        articles.map(async (a) => ({
          article_id: a.article_id,
          title: a.title,
          content: a.content,
          User: {
            user_id: a.User.user_id,
            username: a.User.username,
            email: a.User.email,
            fullname: a.User.fullname,
            profile: a.User.profile
              ? await generateFileUrl(
                  a.User.profile,
                  appUrl,
                  profileStorageConfig,
                )
              : '',
          },
          Tag: a.Tag.map((tag) => tag.tag_name),
          cover:
            (await generateFileUrl(
              a.Cover?.filename,
              appUrl,
              this.fileStorageOptions,
            )) || null,
          created_at: a.created_at,
          updated_at: a.updated_at,
        })),
      );
    } else {
      return {
        article_id: articles.article_id,
        title: articles.title,
        content: articles.content,
        User: {
          fullname: articles.User.fullname,
          user_id: articles.User.user_id,
          username: articles.User.username,
          email: articles.User.email,
          profile:
            (articles.User.profile &&
              (await generateFileUrl(
                articles.User.profile,
                appUrl,
                profileStorageConfig,
              ))) ||
            '',
        },
        Tag: articles.Tag.map((tag) => tag.tag_name),
        cover: articles.Cover
          ? await generateFileUrl(
              articles.Cover.filename,
              appUrl,
              this.fileStorageOptions,
            )
          : '',
        created_at: articles.created_at,
        updated_at: articles.updated_at,
      };
    }
  }
}
