import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FileVisibility } from '@prisma/client';
import { UserModel } from '@src/models';
import { PrismaService } from '@src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { FileStorageOptions } from '@src/file-storage/types';
import { deleteFile, uploadFile } from '@src/common/utils/file-storage';
import { ValidationService } from '@src/common/validation.service';
import { UserValidation } from './user.validation';
import { UpdateUserRequest } from './dto';

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

  async update(
    user_id: string,
    data: UpdateUserRequest,
    file?: Express.Multer.File,
  ): Promise<UserModel> {
    const UpdateUserRequest = this.validationService.validate(
      UserValidation.UPDATE_USER_REQUEST,
      data,
    );
    console.log('UpdateUserRequest', UpdateUserRequest);

    const user = await this.prismaService.user.findUnique({
      where: {
        user_id,
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
    try {
      const transaction = await this.prismaService.$transaction(
        async (prisma) => {
          if (file && file.originalname !== user.profile) {
            UpdateUserRequest.profile = await uploadFile(
              file,
              this.fileStorageOptions,
            );
          }

          if (file && file.originalname !== user.profile) {
            await deleteFile(user.profile, this.fileStorageOptions);
          }

          return await prisma.user.update({
            where: {
              user_id: user.user_id,
            },
            data: UpdateUserRequest,
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
}
