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
import { ConfigService } from '@nestjs/config';
import { deleteFile, generateFileUrl } from 'src/utils/file-storage-util';
import { FileStorageOptions } from 'src/file-storage/types';
import { FileVisibility } from '@prisma/client';

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

  async create(createArticleDto: CreateArticleDto) {
    const { tags, user_id, cover, ...articleData } = createArticleDto;
    const filename = cover ? cover.split('/').pop() : null;
    const trasnsaction = await this.prismaService.$transaction(
      async (prisma) => {
        try {
          const tagOperations = tags?.map((tag) => {
            return prisma.tag.upsert({
              where: { tag_name: tag },
              update: {},
              create: { tag_name: tag },
            });
          });

          const tagResults = await Promise.all(tagOperations || []);
          const tagNames = tagResults.map((tag) => tag.tag_name);

          const coverFile = cover
            ? await prisma.file.create({
                data: {
                  filename,
                  visibility: this.fileVisibility,
                  user_id,
                },
              })
            : null;

          const article = await prisma.article.create({
            data: {
              ...articleData,
              User: { connect: { user_id } },
              Cover: coverFile ? { connect: { id: coverFile.id } } : undefined,
              Tag: { connect: tagNames.map((tag) => ({ tag_name: tag })) },
            },
          });

          return prisma.article.findUnique({
            where: { article_id: article.article_id },
            include: { User: true, Tag: true, Cover: true },
          });
        } catch (error) {

          try {
            if (cover) {
              const deleteMessage = await deleteFile(filename, this.fileStorageOptions);
            }
          } catch (error) {
            console.error(error.message);
          }
          throw new InternalServerErrorException(
            `Error creating article: ${error.message}`,
          );
        }
      },
    );

    return this.transformArticle(trasnsaction);
  }

  async search(
    query: articleFilter,
  ): Promise<{ paging: Paging; data: ArticleModel | ArticleModel[] }> {
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

  async find(id: string): Promise<ArticleModel | ArticleModel[]> {
    const article = await this.prismaService.article.findUnique({
      where: { article_id: id },
      include: { User: true, Tag: true, Cover: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.transformArticle(article);
  }

  async update(id: string, dto: UpdateArticleDto) {
    const { tags, cover, user_id, ...articleData } = dto;
    const article = await this.prismaService.article.findUnique({
      where: { article_id: id },
      include: { User: true, Cover: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.User.user_id !== user_id) {
      throw new ForbiddenException(
        'You are not authorized to update this article',
      );
    }

    const trasnsaction = await this.prismaService.$transaction(
      async (prisma) => {
        try {
          const tagOperations = tags?.map((tag) => {
            return prisma.tag.upsert({
              where: { tag_name: tag },
              update: {},
              create: { tag_name: tag },
            });
          });

          const tagResults = await Promise.all(tagOperations || []);
          const tagNames = tagResults.map((tag) => tag.tag_name);

          cover
            ? await prisma.file.update({
                where: { id: article.Cover.id },
                data: { filename: cover },
              })
            : null;

          await prisma.article.update({
            where: { article_id: id },
            data: {
              ...articleData,
              User: { connect: { user_id } },
              Tag: { connect: tagNames.map((tag) => ({ tag_name: tag })) },
            },
          });
          return prisma.article.findUnique({
            where: { article_id: id },
            include: { User: true, Tag: true, Cover: true },
          });
        } catch (error) {
          try {
            if (cover) {
              const deleteMessage = await deleteFile(cover, this.fileStorageOptions);
              console.error(deleteMessage);
            }
          } catch (error) {
            console.error(error.message);
          }
          throw new InternalServerErrorException(
            `Error updating article: ${error.message}`,
          );
        }
      },
    );

    return this.transformArticle(trasnsaction);
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
  ): Promise<ArticleModel | ArticleModel[]> {
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
          user_id: articles.User.user_id,
          username: articles.User.username,
          email: articles.User.email,
        },
        Tag: articles.Tag.map((tag) => tag.tag_name),
        cover:
          (await generateFileUrl(
            articles.Cover?.filename,
            appUrl,
            this.fileStorageOptions,
          )) || null,
        created_at: articles.created_at,
        updated_at: articles.updated_at,
      };
    }
  }
}
