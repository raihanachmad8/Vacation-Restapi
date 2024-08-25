import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  deleteFile,
  generateRandomFileName,
  uploadFile,
} from '@src/common/utils';
import { FileStorageOptions } from '@src/file-storage/types';
import { PrismaService } from '@src/prisma/prisma.service';
import { ValidationService } from '@src/common/validation.service';
import { HiddenGemsValidation } from './hidden-gems.validation';
import { DayOfWeek, FileVisibility, Role, Status, User } from '@prisma/client';
import { HiddenGemsModel } from '@src/models/hidden-gems.model';
import { hiddenGemsFilter } from './types';
import { HiddenGemsCommentRepliesModel, Paging } from '@src/models';
import {
  CommentRequest,
  CreateHiddenGemsRequest,
  HiddenGemsCommentRepliesRequest,
  UpdateHiddenGemsRequest,
} from './dto';
import { HiddenGemsCategories } from 'prisma/seeder/hidden-gems-category.seed';
import { HiddenGemsCommentModel } from '@src/models/hidden-gems-comment.model';
import { hiddenGemsStorageConfig } from '@root/config/storage.config';

@Injectable()
export class HiddenGemsService {
  private readonly hiddenGemsStorageConfig: FileStorageOptions =
    hiddenGemsStorageConfig;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async getCategories(search?): Promise<HiddenGemsCategories[]> {
    try {
      const where = search
        ? {
            category_name: {
              contains: search,
            },
          }
        : {};

      const categories = await this.prismaService.hiddenGemsCategory.findMany({
        where,
      });

      return categories;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async createHiddenGems(
    request: CreateHiddenGemsRequest,
  ): Promise<HiddenGemsModel> {
    const validatedRequest = this.validationService.validate(
      HiddenGemsValidation.CREATE_HIDDEN_GEMS_REQUEST,
      request,
    );

    await Promise.all(
      validatedRequest.photos.map(async (photo) => {
        photo.filename = await generateRandomFileName(photo);
      }),
    );

    const hiddenGemsCategory =
      await this.prismaService.hiddenGemsCategory.findUnique({
        where: {
          category_id: validatedRequest.category_id,
        },
      });

    if (!hiddenGemsCategory) {
      throw new NotFoundException('Category not found');
    }
    try {
      const transaction = await this.prismaService.$transaction(
        async (prisma) => {
          const hiddenGems = await prisma.hiddenGems.create({
            data: {
              title: validatedRequest.title,
              price_start: validatedRequest.price_start,
              price_end: validatedRequest.price_end,
              location: validatedRequest.location,
              description: validatedRequest.description,
              User: {
                connect: {
                  user_id: validatedRequest.user_id,
                },
              },
              HiddenGemsCategory: {
                connect: {
                  category_id: validatedRequest.category_id,
                },
              },
              OperatingDaysAndHours: {
                create: validatedRequest.operation_days,
              },
            },
          });
          await Promise.all(
            validatedRequest.photos.map(async (photo) => {
              await uploadFile(
                photo,
                this.hiddenGemsStorageConfig,
                photo.filename,
              );
              await prisma.file.create({
                data: {
                  filename: photo.filename,
                  visibility: FileVisibility.PUBLIC,
                  User: {
                    connect: {
                      user_id: validatedRequest.user_id,
                    },
                  },
                  HiddenGems: {
                    connect: {
                      hidden_gem_id: hiddenGems.hidden_gem_id,
                    },
                  },
                },
              });
            }),
          );

          return await prisma.hiddenGems.findUnique({
            where: {
              hidden_gem_id: hiddenGems.hidden_gem_id,
            },
            include: {
              HiddenGemsCategory: true,
              OperatingDaysAndHours: true,
              User: true,
              Photos: true,
              HiddenGemsRating: true,
            },
          });
        },
      );

      return HiddenGemsModel.toJson(transaction, {
        marked_user_id: validatedRequest.user_id,
      });
    } catch (error) {
      await Promise.all(
        validatedRequest.photos.map(async (photo) => {
          await deleteFile(photo.filename, this.hiddenGemsStorageConfig);
        }),
      );
      throw new InternalServerErrorException('Failed to create hidden gems');
    }
  }

  async search(
    query: hiddenGemsFilter,
    user?: User,
  ): Promise<{
    data: HiddenGemsModel[];
    paging: Paging;
  }> {
    const validatedQuery = this.validationService.validate(
      HiddenGemsValidation.HIDDEN_GEMS_FILTER,
      query,
    );

    const {
      u,
      stat,
      stat_day,
      category_id,
      location,
      price_start,
      price_end,
      rating,
      s,
      limit = 10,
      page = 1,
      orderBy = 'updated_at',
      order = 'desc',
    } = validatedQuery;

    const take = Math.min(limit, 25);
    const skip = (page - 1) * take;
    const orderConfig = orderBy ? { [orderBy]: order } : undefined;

    let status: Status[] = (stat as Status[]) || [Status.APPROVE];
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
              : status.filter((s) => s === Status.APPROVE);
        } else {
          status = status.filter((s) => s === Status.APPROVE);
        }
      }
    } else {
      status = status.filter((s) => s === Status.APPROVE);
    }

    const where = {
      ...(u ? { User: { user_id: u } } : {}),
      ...(status ? { status: { in: status } } : {}),
      ...(stat_day
        ? {
            OperatingDaysAndHours: {
              some: { day: { in: stat_day as DayOfWeek[] } },
            },
          }
        : {}),
      ...(category_id ? { category_id } : {}),
      ...(location ? { location: { contains: location } } : {}),
      ...(price_start ? { price_start: { gte: price_start } } : {}),
      ...(price_end ? { price_end: { lte: price_end } } : {}),
      ...(s
        ? {
            OR: [{ title: { contains: s } }, { description: { contains: s } }],
          }
        : {}),
    };

    try {
      const [data, count] = await Promise.all([
        this.prismaService.hiddenGems.findMany({
          where,
          include: {
            HiddenGemsCategory: true,
            User: true,
            Photos: true,
          },
          orderBy: orderConfig,
          skip,
          take,
        }),
        this.prismaService.hiddenGems.count({ where }),
      ]);

      const hiddenGemIds = data.map((hiddenGems) => hiddenGems.hidden_gem_id);

      // Fetch the average ratings for these hidden gems
      const ratings = await this.prismaService.hiddenGemsRating.groupBy({
        by: ['hidden_gem_id'],
        _avg: {
          rating: true,
        },
        where: {
          hidden_gem_id: {
            in: hiddenGemIds,
          },
        },
      });

      const filteredRatings = ratings.filter((r) =>
        rating
          ? (r._avg.rating || 0) >= rating && (r._avg.rating || 0) <= rating + 1
          : true,
      );

      const validHiddenGemIds = new Set(
        filteredRatings.map((r) => r.hidden_gem_id),
      );

      // Filter hidden gems data by the valid IDs
      const filteredHiddenGems = data.filter((hiddenGems) =>
        validHiddenGemIds.has(hiddenGems.hidden_gem_id),
      );

      return {
        data: await Promise.all(
          filteredHiddenGems.map((hiddenGems) =>
            HiddenGemsModel.toJson(hiddenGems, {
              rating:
                filteredRatings.find(
                  (r) => r.hidden_gem_id === hiddenGems.hidden_gem_id,
                )?._avg.rating || 0,
              marked_user_id: user?.user_id,
            }),
          ),
        ),
        paging: {
          current_page: page || 1,
          first_page: 1,
          last_page: Math.ceil(count / take),
          total: count,
        },
      };
    } catch (error) {
      console.log('error', error);
      throw new Error(`Failed to search hidden gems: ${error.message}`);
    }
  }

  async getHiddenGemsById(
    hidden_gem_id: string,
    user?: User,
  ): Promise<HiddenGemsModel> {
    const hiddenGems = await this.prismaService.hiddenGems.findUnique({
      where: {
        hidden_gem_id,
      },
      include: {
        Photos: true,
        User: true,
        OperatingDaysAndHours: true,
        HiddenGemsCategory: true,
        HiddenGemsRating: true,
        HiddenGemsComment: {
          include: {
            HiddenGemsRating: true,
            User: true,
            HiddenGemsReply: {
              include: {
                User: true,
                ChildReplies: {
                  include: {
                    User: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!hiddenGems) {
      throw new NotFoundException('Hidden gems not found');
    }

    if (
      hiddenGems.status !== Status.APPROVE &&
      hiddenGems.User.user_id !== user?.user_id &&
      user?.role !== Role.ADMIN
    ) {
      throw new NotFoundException('Hidden gems not found');
    }

    let rating = 0;
    hiddenGems.HiddenGemsRating &&
      (rating =
        hiddenGems.HiddenGemsRating.find((r) => r.user_id === user?.user_id)
          ?.rating || 0);
    return HiddenGemsModel.toJson(hiddenGems, {
      rating,
      marked_user_id: user?.user_id,
    });
  }

  async updateHiddenGems(
    request: UpdateHiddenGemsRequest,
    user: User,
  ): Promise<HiddenGemsModel> {
    const hiddenGems = await this.prismaService.hiddenGems.findUnique({
      where: { hidden_gem_id: request.hidden_gems_id },
      include: { Photos: true, User: true },
    });

    if (!hiddenGems) {
      throw new NotFoundException('Hidden gems not found');
    }

    if (hiddenGems.User.user_id !== user.user_id) {
      throw new ForbiddenException('Forbidden to update hidden gems');
    }

    const validatedRequest = this.validationService.validate(
      HiddenGemsValidation.UPDATE_HIDDEN_GEMS_REQUEST,
      request,
    );

    // Get existing photos
    const oldPhotos = await this.prismaService.file.findMany({
      where: {
        HiddenGems: { some: { hidden_gem_id: request.hidden_gems_id } },
        filename: { in: hiddenGems.Photos.map((photo) => photo.filename) },
      },
    });

    const oldPhotoFilenames = oldPhotos.map((photo) => photo.filename);

    // Determine new and delete photos
    const newPhotos = validatedRequest.photos.filter(
      (photo) => !oldPhotoFilenames.includes(photo.originalname),
    );

    const deletePhotos = oldPhotos.filter(
      (photo) =>
        !validatedRequest.photos.some((p) => p.originalname === photo.filename),
    );

    try {
      // Start transaction
      const transaction = await this.prismaService.$transaction(
        async (prisma) => {
          // Update hidden gems
          let hiddenGemsStatus = hiddenGems.status;

          switch (hiddenGemsStatus) {
            case Status.REJECT:
            case Status.REVISION:
              hiddenGemsStatus = Status.PENDING;
              break;
            default:
              hiddenGemsStatus = hiddenGems.status;
              break;
          }

          const updatedHiddenGems = await prisma.hiddenGems.update({
            where: { hidden_gem_id: request.hidden_gems_id },
            data: {
              title: validatedRequest.title,
              price_start: validatedRequest.price_start,
              price_end: validatedRequest.price_end,
              location: validatedRequest.location,
              description: validatedRequest.description,
              status: hiddenGemsStatus,
              OperatingDaysAndHours: {
                deleteMany: {},
                create: validatedRequest.operation_days,
              },
            },
            include: {
              HiddenGemsCategory: true,
              OperatingDaysAndHours: true,
              User: true,
              Photos: true,
            },
          });

          // Handle new photos
          await Promise.all(
            newPhotos.map(async (photo) => {
              const newFilename = await uploadFile(
                photo,
                this.hiddenGemsStorageConfig,
              );
              await prisma.file.create({
                data: {
                  filename: newFilename,
                  visibility: FileVisibility.PUBLIC,
                  HiddenGems: {
                    connect: { hidden_gem_id: updatedHiddenGems.hidden_gem_id },
                  },
                  User: { connect: { user_id: user.user_id } },
                },
              });
              await prisma.file.deleteMany({
                where: {
                  filename: {
                    in: deletePhotos.map((photo) => photo.filename),
                  },
                  HiddenGems: {
                    some: {
                      hidden_gem_id: request.hidden_gems_id,
                    },
                  },
                },
              });
              deletePhotos.map(async (photo) => {
                await deleteFile(photo.filename, this.hiddenGemsStorageConfig);
              });
            }),
          );

          return await prisma.hiddenGems.findUnique({
            where: { hidden_gem_id: request.hidden_gems_id },
            include: {
              HiddenGemsCategory: true,
              OperatingDaysAndHours: true,
              User: true,
              Photos: true,
            },
          });
        },
      );

      return HiddenGemsModel.toJson(transaction);
    } catch (error) {
      // Handle error and rollback if necessary
      await Promise.all(
        newPhotos.map(async (photo) => {
          await deleteFile(photo.filename, this.hiddenGemsStorageConfig);
        }),
      );
      throw new InternalServerErrorException('Failed to update hidden gems');
    }
  }

  async deleteHiddenGems(hidden_gem_id: string, user: User) {
    const hiddenGems = await this.prismaService.hiddenGems.findUnique({
      where: {
        hidden_gem_id,
      },
      include: {
        Photos: true,
        User: true,
      },
    });

    if (!hiddenGems) {
      throw new NotFoundException('Hidden gems not found');
    }
    if (hiddenGems.User.user_id !== user.user_id) {
      throw new ForbiddenException('Forbidden to delete hidden gems');
    }

    const filenamesToDelete: string[] = [];

    try {
      // Start a transaction
      await this.prismaService.$transaction(async (prisma) => {
        filenamesToDelete.push(
          ...hiddenGems.Photos.map((photo) => photo.filename),
        );
        await prisma.file.deleteMany({
          where: {
            filename: {
              in: filenamesToDelete,
            },
            HiddenGems: {
              some: {
                hidden_gem_id,
              },
            },
          },
        });

        await prisma.hiddenGems.delete({
          where: {
            hidden_gem_id,
          },
        });
      });

      await Promise.all(
        filenamesToDelete.map(async (filename) => {
          await deleteFile(filename, this.hiddenGemsStorageConfig);
        }),
      );

      return true;
    } catch (error) {
      await Promise.all(
        filenamesToDelete.map(async (filename) => {
          await deleteFile(filename, this.hiddenGemsStorageConfig);
        }),
      );
      throw new InternalServerErrorException('Failed to delete hidden gems');
    }
  }

  async changeStatus(
    hidden_gem_id: string,
    status: Status,
    user: User,
  ): Promise<HiddenGemsModel> {
    const hiddenGems = await this.prismaService.hiddenGems.findUnique({
      where: {
        hidden_gem_id,
      },
      include: {
        User: true,
      },
    });

    if (!hiddenGems) {
      throw new NotFoundException('Hidden gems not found');
    }

    if (hiddenGems.User.user_id !== user.user_id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Forbidden to change status hidden gems');
    }

    try {
      const transaction = await this.prismaService.$transaction(
        async (prisma) => {
          const updatedArticle = await prisma.hiddenGems.update({
            where: {
              hidden_gem_id,
            },
            data: {
              status,
            },
            include: {
              HiddenGemsCategory: true,
              OperatingDaysAndHours: true,
              User: true,
              Photos: true,
            },
          });

          return updatedArticle;
        },
      );

      return await HiddenGemsModel.toJson(transaction);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating hidden gems status: ${error.message}`,
      );
    }
  }

  async commentHiddenGems(
    request: CommentRequest,
  ): Promise<HiddenGemsCommentModel> {
    const validatedRequest = this.validationService.validate(
      HiddenGemsValidation.HIDDEN_GEMS_COMMENT_REQUEST,
      request,
    );

    const { hidden_gems_id, user_id, comment, rating } = validatedRequest;

    // Fetch hidden gems and user
    const hiddenGems = await this.prismaService.hiddenGems.findUnique({
      where: { hidden_gem_id: hidden_gems_id },
    });

    if (!hiddenGems) {
      throw new NotFoundException('Hidden gems not found');
    }

    const user = await this.prismaService.user.findUnique({
      where: { user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const commentResult = await this.prismaService.hiddenGemsComment.upsert({
        where: {
          hidden_gem_id_user_id: {
            hidden_gem_id: hidden_gems_id,
            user_id,
          },
        },
        update: {
          comment,
          HiddenGemsRating: {
            upsert: {
              where: {
                hidden_gem_id_user_id: {
                  hidden_gem_id: hidden_gems_id,
                  user_id,
                },
              },
              create: {
                rating,
                HiddenGems: { connect: { hidden_gem_id: hidden_gems_id } },
                User: { connect: { user_id } },
              },
              update: {
                rating,
              },
            },
          },
        },
        create: {
          comment,
          HiddenGems: { connect: { hidden_gem_id: hidden_gems_id } },
          User: { connect: { user_id } },
          HiddenGemsRating: {
            create: {
              rating,
              HiddenGems: { connect: { hidden_gem_id: hidden_gems_id } },
              User: { connect: { user_id } },
            },
          },
        },
        include: {
          User: true,
          HiddenGemsRating: {
            where: { user_id },
          },
        },
      });

      return HiddenGemsCommentModel.toJson(commentResult, {
        marked_user_id: user.user_id,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to comment hidden gems');
    }
  }

  async replyCommentHiddenGems(
    request: HiddenGemsCommentRepliesRequest,
  ): Promise<HiddenGemsCommentRepliesModel> {
    const validatedRequest = this.validationService.validate(
      HiddenGemsValidation.HIDDEN_GEMS_COMMENT_REPLIES_REQUEST,
      request,
    );

    const user = await this.prismaService.user.findUnique({
      where: {
        user_id: validatedRequest.user_id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const comment = await this.prismaService.hiddenGemsComment.findUnique({
      where: {
        comment_id: validatedRequest.comment_id,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    try {
      const transaction = await this.prismaService.$transaction(
        async (prisma) => {
          const replies = await prisma.hiddenGemsReply.create({
            data: {
              comment: validatedRequest.comment,
              User: {
                connect: {
                  user_id: validatedRequest.user_id,
                },
              },
              HiddenGemsComment: {
                connect: {
                  comment_id: validatedRequest.comment_id,
                },
              },
            },
            include: {
              User: true,
            },
          });
          return replies;
        },
      );

      return HiddenGemsCommentRepliesModel.toJson(transaction);
    } catch (error) {
      throw new InternalServerErrorException('Failed to reply comment');
    }
  }

  async replyReplyCommentHiddenGems(
    request: HiddenGemsCommentRepliesRequest,
  ): Promise<HiddenGemsCommentRepliesModel> {
    const validatedRequest = this.validationService.validate(
      HiddenGemsValidation.HIDDEN_GEMS_COMMENT_REPLIES_REQUEST,
      request,
    );

    const user = await this.prismaService.user.findUnique({
      where: {
        user_id: validatedRequest.user_id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const reply = await this.prismaService.hiddenGemsReply.findUnique({
      where: {
        reply_id: validatedRequest.parent_id,
      },
    });

    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    try {
      const transaction = await this.prismaService.$transaction(
        async (prisma) => {
          const replies = await prisma.hiddenGemsReply.create({
            data: {
              comment: validatedRequest.comment,
              ParentReply: {
                connect: {
                  reply_id: validatedRequest.parent_id,
                },
              },
              User: {
                connect: {
                  user_id: validatedRequest.user_id,
                },
              },
              HiddenGemsComment: {
                connect: {
                  comment_id: reply.comment_id,
                },
              },
            },
            include: {
              User: true,
            },
          });
          return replies;
        },
      );
      return await HiddenGemsCommentRepliesModel.toJson(transaction);
    } catch (error) {
      throw new InternalServerErrorException('Failed to reply reply comment');
    }
  }
}
