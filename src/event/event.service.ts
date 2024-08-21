import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ValidationService } from '@src/common/validation.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateEventRequest, UpdateEventRequest } from './dto';
import { EventValidation } from './event.validation';
import {
  deleteFile,
  eventStorageConfig,
  generateRandomFileName,
  uploadFile,
} from '@src/common/utils';
import { FileStorageOptions } from '@src/file-storage/types';
import { FileVisibility, Role, Status, User } from '@prisma/client';
import { EventModel } from '@src/models';
import { eventFilter } from './types';
import { Paging } from '@src/models';

@Injectable()
export class EventService {
  private readonly eventStorageConfig: FileStorageOptions = eventStorageConfig;

  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async getCategories(search?: string): Promise<string[]> {
    const where = search
      ? {
          category_name: {
            contains: search,
          },
        }
      : {};

    const categories = await this.prismaService.eventCategory.findMany({
      where,
      select: {
        category_name: true,
      },
    });

    return categories.map((category) => category.category_name);
  }

  async createEvent(request: CreateEventRequest): Promise<EventModel> {
    const validatedRequest = this.validationService.validate(
      EventValidation.CREATE_EVENT_REQUEST,
      request,
    );

    await Promise.all(
      validatedRequest.photos.map(async (photo) => {
        photo.filename = await generateRandomFileName(photo);
      }),
    );

    const eventCategory = await this.prismaService.eventCategory.findUnique({
      where: {
        category_id: validatedRequest.category_id,
      },
    });

    if (!eventCategory) {
      throw new NotFoundException('Category not found');
    }

    try {
      const transaction = await this.prismaService.$transaction(
        async (prisma) => {
          const event = await prisma.event.create({
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
              EventCategory: {
                connect: {
                  category_id: validatedRequest.category_id,
                },
              },
              EventOperatingDaysAndHours: {
                create: validatedRequest.operation_days,
              },
            },
          });

          await Promise.all(
            validatedRequest.photos.map(async (photo) => {
              await uploadFile(photo, this.eventStorageConfig, photo.filename);
              await prisma.file.create({
                data: {
                  filename: photo.filename,
                  visibility: FileVisibility.PUBLIC,
                  User: {
                    connect: {
                      user_id: validatedRequest.user_id,
                    },
                  },
                  Event: {
                    connect: {
                      event_id: event.event_id,
                    },
                  },
                },
              });
            }),
          );

          return await prisma.event.findUnique({
            where: {
              event_id: event.event_id,
            },
            include: {
              EventCategory: true,
              EventOperatingDaysAndHours: true,
              Photos: true,
            },
          });
        },
      );

      return EventModel.toJson(transaction);
    } catch (error) {
      await Promise.all(
        validatedRequest.photos.map(async (photo) => {
          await deleteFile(photo.filename, this.eventStorageConfig);
        }),
      );
    }
  }

  async search(
    query: eventFilter,
    user?: User,
  ): Promise<{
    data: EventModel[];
    paging: Paging;
  }> {
    const validatedQuery = this.validationService.validate(
      EventValidation.EVENT_FILTER,
      query,
    );

    const {
      u,
      stat,
      category_id,
      location,
      price_start,
      price_end,
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
        this.prismaService.event.findMany({
          where,
          include: {
            EventCategory: true,
            User: true,
            Photos: true,
            EventInterest: true,
          },
          orderBy: orderConfig,
          skip,
          take,
        }),
        this.prismaService.event.count({ where }),
      ]);

      return {
        data: await Promise.all(
          data.map((event) =>
            EventModel.toJson(event, { marked_user_id: user?.user_id }),
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
      throw new InternalServerErrorException(
        `Failed to search event: ${error.message}`,
      );
    }
  }

  async getEventById(event_id: string, user: User): Promise<EventModel> {
    const event = await this.prismaService.event.findUnique({
      where: {
        event_id,
      },
      include: {
        EventOperatingDaysAndHours: true,
        Photos: true,
        User: true,
        EventCategory: true,
        EventInterest: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (
      event.status !== Status.APPROVE &&
      event.User.user_id !== user?.user_id &&
      user?.role !== Role.ADMIN
    ) {
      throw new NotFoundException('Event not found');
    }

    return EventModel.toJson(event, { marked_user_id: user?.user_id });
  }

  async updateEvent(
    request: UpdateEventRequest,
    user: User,
  ): Promise<EventModel> {
    const event = await this.prismaService.event.findUnique({
      where: { event_id: request.event_id },
      include: { User: true, Photos: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.User.user_id !== user.user_id) {
      throw new ForbiddenException('Forbidden to update hidden gems');
    }

    const validatedRequest = this.validationService.validate(
      EventValidation.UPDATE_EVENT_REQUEST,
      request,
    );

    const oldPhotos = await this.prismaService.file.findMany({
      where: {
        Event: { some: { event_id: request.event_id } },
        filename: { in: event.Photos.map((photo) => photo.filename) },
      },
    });

    const oldPhotoFilenames = oldPhotos.map((photo) => photo.filename);

    const newPhotos = validatedRequest.photos.filter(
      (photo) => !oldPhotoFilenames.includes(photo.originalname),
    );

    const deletePhotos = oldPhotos.filter(
      (photo) =>
        !validatedRequest.photos.some((p) => p.originalname === photo.filename),
    );

    try {
      const transaction = await this.prismaService.$transaction(
        async (prisma) => {
          let eventStatus = event.status;

          switch (eventStatus) {
            case Status.REJECT:
            case Status.REVISION:
              eventStatus = Status.PENDING;
              break;
            default:
              eventStatus = event.status;
              break;
          }

          const updateEvent = await prisma.event.update({
            where: { event_id: request.event_id },
            data: {
              title: validatedRequest.title,
              price_start: validatedRequest.price_start,
              price_end: validatedRequest.price_end,
              location: validatedRequest.location,
              description: validatedRequest.description,
              status: eventStatus,
              EventOperatingDaysAndHours: {
                deleteMany: {},
                create: validatedRequest.operation_days,
              },
            },
            include: {
              EventCategory: true,
              EventInterest: true,
              EventOperatingDaysAndHours: true,
              User: true,
              Photos: true,
            },
          });

          await Promise.all(
            newPhotos.map(async (photo) => {
              const newFilename = await uploadFile(
                photo,
                this.eventStorageConfig,
              );
              await prisma.file.create({
                data: {
                  filename: newFilename,
                  visibility: FileVisibility.PUBLIC,
                  Event: { connect: { event_id: updateEvent.event_id } },
                  User: { connect: { user_id: user.user_id } },
                },
              });
              await prisma.file.deleteMany({
                where: {
                  filename: {
                    in: deletePhotos.map((photo) => photo.filename),
                  },
                  Event: {
                    some: {
                      event_id: request.event_id,
                    },
                  },
                },
              });
              deletePhotos.map(async (photo) => {
                await deleteFile(photo.filename, this.eventStorageConfig);
              });
            }),
          );

          return await prisma.event.findUnique({
            where: { event_id: request.event_id },
            include: {
              EventCategory: true,
              EventOperatingDaysAndHours: true,
              User: true,
              Photos: true,
            },
          });
        },
      );

      return EventModel.toJson(transaction, { marked_user_id: user.user_id });
    } catch (error) {
      await Promise.all(
        newPhotos.map(async (photo) => {
          await deleteFile(photo.filename, this.eventStorageConfig);
        }),
      );
      throw new InternalServerErrorException('Failed to update event');
    }
  }

  async deleteEvent(event_id: string, user: User) {
    const event = await this.prismaService.event.findUnique({
      where: {
        event_id,
      },
      include: {
        Photos: true,
        User: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.User.user_id !== user.user_id) {
      throw new ForbiddenException('Forbidden to delete event');
    }

    const filenamesToDelete: string[] = [];

    try {
      await this.prismaService.$transaction(async (prisma) => {
        filenamesToDelete.push(...event.Photos.map((photo) => photo.filename));
        await prisma.file.deleteMany({
          where: {
            filename: {
              in: filenamesToDelete,
            },
            Event: {
              some: {
                event_id,
              },
            },
          },
        });

        await prisma.event.delete({
          where: {
            event_id,
          },
        });
      });

      await Promise.all(
        filenamesToDelete.map(async (filename) => {
          await deleteFile(filename, this.eventStorageConfig);
        }),
      );

      return true;
    } catch (error) {
      await Promise.all(
        filenamesToDelete.map(async (filename) => {
          await deleteFile(filename, this.eventStorageConfig);
        }),
      );
      throw new InternalServerErrorException('Failed to delete event');
    }
  }

  async changeStatus(
    event_id: string,
    status: Status,
    user: User,
  ): Promise<EventModel> {
    const event = await this.prismaService.event.findUnique({
      where: {
        event_id,
      },
      include: {
        User: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.User.user_id !== user.user_id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Forbidden to change status of event');
    }

    try {
      const transaction = await this.prismaService.$transaction(
        async (prisma) => {
          const updatedArticle = await prisma.event.update({
            where: {
              event_id,
            },
            data: {
              status,
            },
            include: {
              EventCategory: true,
              EventInterest: true,
              EventOperatingDaysAndHours: true,
              User: true,
              Photos: true,
            },
          });

          return updatedArticle;
        },
      );

      return await EventModel.toJson(transaction, {
        marked_user_id: user.user_id,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating event status: ${error.message}`,
      );
    }
  }

  async eventInterest(
    event_id: string,
    user: User,
  ): Promise<{ interest: boolean }> {
    const event = await this.prismaService.event.findUnique({
      where: {
        event_id,
        user_id: user.user_id,
      },
    });

    if (!event) {
      await this.prismaService.event.update({
        where: {
          event_id,
        },
        data: {
          event_id: event_id,
          user_id: user.user_id,
        },
      });

      return { interest: true };
    } else {
      await this.prismaService.event.delete({
        where: {
          event_id,
          user_id: user.user_id,
        },
      });

      return { interest: false };
    }
  }
}
