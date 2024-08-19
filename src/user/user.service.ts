import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FileVisibility } from '@prisma/client';
import { Paging, UserModel } from '@src/models';
import { PrismaService } from '@src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { FileStorageOptions } from '@src/file-storage/types';
import { deleteFile, uploadFile } from '@src/common/utils/file-storage';
import { ValidationService } from '@src/common/validation.service';
import { UserValidation } from './user.validation';
import { UpdateUserRequest } from './dto';
import { UserFilter } from './types';

@Injectable()
export class UserService {
  private readonly fileVisibility = FileVisibility.PUBLIC;
  private fileStorageOptions: FileStorageOptions = {
    visibility: this.fileVisibility,
    storageFolder: 'profiles',
  };
  constructor(
    private readonly prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async get(user_id: string): Promise<UserModel> {
    const user = await this.prismaService.user.findUnique({
      where: {
        user_id,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await UserModel.toJson(user);
  }

  async update(data: UpdateUserRequest): Promise<UserModel> {
    const UpdateUserRequest = this.validationService.validate(
      UserValidation.UPDATE_USER_REQUEST,
      data,
    );

    const user = await this.prismaService.user.findUnique({
      where: {
        user_id: UpdateUserRequest.user_id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (UpdateUserRequest.password) {
      UpdateUserRequest.password = await this.hashPassword(
        UpdateUserRequest.password,
        user.salt,
      );
    }
    let profileImageName: string;
    try {
      const transaction = await this.prismaService.$transaction(
        async (prisma) => {
          if (
            UpdateUserRequest.profile &&
            UpdateUserRequest.profile.originalname !== user.profile
          ) {
            profileImageName = await uploadFile(
              UpdateUserRequest.profile,
              this.fileStorageOptions,
            );
          }

          if (
            UpdateUserRequest.profile &&
            UpdateUserRequest.profile.originalname !== user.profile
          ) {
            await deleteFile(user.profile, this.fileStorageOptions);
          }

          if (UpdateUserRequest.password) {
            UpdateUserRequest.password = await this.hashPassword(
              UpdateUserRequest.password,
              user.salt,
            );
          }

          return await prisma.user.update({
            where: {
              user_id: user.user_id,
            },
            data: {
              fullname: UpdateUserRequest.fullname,
              email: UpdateUserRequest.email,
              username: UpdateUserRequest.username,
              password: UpdateUserRequest.password,
              profile: profileImageName || user.profile,
            },
          });
        },
      );
      return await UserModel.toJson(transaction);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating user: ${error.message}`,
      );
    }
  }

  private hashPassword(password: string, salt: string): string {
    return bcrypt.hashSync(password, salt);
  }

  async search(query: UserFilter): Promise<{
    data: UserModel[];
    paging: Paging;
  }> {
    const ValidatedRequest = this.validationService.validate(
      UserValidation.USER_FILTER,
      query,
    );

    const {
      s,
      username,
      email,
      fullname,
      limit = 10,
      page = 1,
      orderBy = 'username',
      order = 'asc',
    } = ValidatedRequest;

    const where = {
      ...(s
        ? {
            OR: [
              {
                fullname: {
                  contains: s,
                },
              },
              {
                username: {
                  contains: s,
                },
              },
              {
                email: {
                  contains: s,
                },
              },
            ],
          }
        : {}),

      ...(username
        ? {
            username: {
              contains: username,
            },
          }
        : {}),
      ...(email
        ? {
            email: {
              contains: email,
            },
          }
        : {}),
      ...(fullname
        ? {
            fullname: {
              contains: fullname,
            },
          }
        : {}),
    };

    const take = limit;
    const skip = (page - 1) * take;
    const orderByClause = {
      [orderBy]: order,
    };

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        take,
        skip,
        orderBy: orderByClause,
      }),
      this.prismaService.user.count({
        where,
      }),
    ]);

    const data = await Promise.all(
      users.map(async (user) => {
        return await UserModel.toJson(user);
      }),
    );
    const paging: Paging = {
      current_page: page,
      total,
      last_page: Math.ceil(total / take),
      first_page: 1,
    };

    return {
      data,
      paging,
    };
  }
}
