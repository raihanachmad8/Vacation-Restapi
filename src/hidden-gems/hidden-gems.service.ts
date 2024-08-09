import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  deleteFile,
  generateRandomFileName,
  hiddenGemsStorageConfig,
  uploadFile,
} from '@src/common/utils';
import { FileStorageOptions } from '@src/file-storage/types';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateHiddenGemsRequest } from './dto';
import { ValidationService } from '@src/common/validation.service';
import { HiddenGemsValidation } from './hidden-gems.validation';
import { DayOfWeek, FileVisibility, Role, Status, User } from '@prisma/client';
import { HiddenGemsModel } from '@src/models/hidden-gems.model';
import { hiddenGemsFilter } from './types';
import { Paging } from '@src/models';
import { UpdateHiddenGemsRequest } from './dto/update.dto';

@Injectable()
export class HiddenGemsService {
  private readonly hiddenGemsStorageConfig: FileStorageOptions =
    hiddenGemsStorageConfig;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async getCategories() {
    try {
      const categories = await this.prismaService.hiddenGemsCategory.findMany();
      return categories;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async createHiddenGems(request: CreateHiddenGemsRequest) {
    console.log('Creating hidden gems');
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
              rating: validatedRequest.rating,
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
                  user_id: validatedRequest.user_id,
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
            },
          });
        },
      );

      return HiddenGemsModel.toJson(transaction);
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
      orderBy,
      order = 'asc',
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

    console.log(u, user);

    console.log(status);

    const where = {
      ...(u ? { User: { user_id: u } } : {}),
      ...(status.length > 0 ? { status: { in: status } } : {}),
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
      ...(rating ? { rating: { gte: rating } } : {}),
      ...(s ? { title: { contains: s } } : {}),
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

      return {
        data: await Promise.all(data.map(HiddenGemsModel.toJson)),
        paging: {
          current_page: page,
          first_page: 1,
          last_page: Math.ceil(count / take),
          total: count,
        },
      };
    } catch (error) {
      throw new Error(`Failed to search hidden gems: ${error.message}`);
    }
  }

  async getHiddenGemsById(hidden_gem_id: string, user: User) {
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

    if (
      hiddenGems.status !== Status.APPROVE &&
      hiddenGems.User.user_id !== user?.user_id
    ) {
      throw new NotFoundException('Hidden gems not found');
    }

    return HiddenGemsModel.toJson(hiddenGems);
  }

  async updateHiddenGems(request: UpdateHiddenGemsRequest, user: User) {
    const hiddenGems = await this.prismaService.hiddenGems.findUnique({
      where: {
        hidden_gem_id: request.hidden_gems_id,
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
      throw new ForbiddenException('Forbidden to update hidden gems');
    }

    const validatedRequest = this.validationService.validate(
      HiddenGemsValidation.UPDATE_HIDDEN_GEMS_REQUEST,
      request,
    );

    const oldPhotos = await this.prismaService.file.findMany({
      where: {
        HiddenGems: {
          some: {
            hidden_gem_id: request.hidden_gems_id,
          },
        },
        filename: {
          in: hiddenGems.Photos.map((photo) => photo.filename),
        },
      },
    });

    // Determine new and delete photos
    const oldPhotoFilenames = oldPhotos.map((photo) => photo.filename);
    const newPhotos = validatedRequest.photos.filter(
      (photo) => !oldPhotoFilenames.includes(photo.originalname),
    );

    const deletePhotos = oldPhotos.filter(
      (photo) =>
        !validatedRequest.photos.some((p) => p.originalname === photo.filename),
    );

    console.log(oldPhotoFilenames, newPhotos, deletePhotos);

    try {
      // Start transaction
      const transaction = await this.prismaService.$transaction(
        async (prisma) => {
          // Update hidden gems

          let hiddenGemsStatus = hiddenGems.status;

          switch (hiddenGemsStatus) {
            case Status.REJECT:
              hiddenGemsStatus = Status.PENDING;
              break;
            case 'REVISION':
              hiddenGemsStatus = Status.PENDING;
              break;
            default:
              hiddenGemsStatus = hiddenGems.status;
              break;
          }
          const updatedHiddenGems = await prisma.hiddenGems.update({
            where: {
              hidden_gem_id: request.hidden_gems_id,
            },
            data: {
              title: validatedRequest.title,
              price_start: validatedRequest.price_start,
              price_end: validatedRequest.price_end,
              location: validatedRequest.location,
              rating: validatedRequest.rating,
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
              photo.filename = await generateRandomFileName(photo);
              await uploadFile(
                photo,
                this.hiddenGemsStorageConfig,
                photo.filename,
              );
              await prisma.file.create({
                data: {
                  filename: photo.filename,
                  visibility: FileVisibility.PUBLIC,
                  HiddenGems: {
                    connect: {
                      hidden_gem_id: updatedHiddenGems.hidden_gem_id,
                    },
                  },
                  User: {
                    connect: {
                      user_id: user.user_id,
                    },
                  },
                },
              });
            }),
          );
          return updatedHiddenGems;
        },
      );
      await Promise.all(
        deletePhotos.map(async (photo) => {
          await deleteFile(photo.filename, this.hiddenGemsStorageConfig);
          await this.prismaService.file.deleteMany({
            where: {
              filename: photo.filename,
              HiddenGems: {
                some: {
                  hidden_gem_id: request.hidden_gems_id,
                },
              },
            },
          });
        }),
      );

      return HiddenGemsModel.toJson(transaction);
    } catch (error) {
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

  async changeStatus(hidden_gem_id: string, status: Status, user: User) {
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
        `Error updating article: ${error.message}`,
      );
    }
  }
}
