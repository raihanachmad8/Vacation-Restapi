import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FileVisibility, User } from '@prisma/client';
import { User as UserModel } from 'src/models';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { FileStorageOptions } from 'src/file-storage/types';
import { deleteFile, uploadFile } from 'src/common/utils/file-storage';

@Injectable()
export class UserService {
  private readonly fileVisibility = FileVisibility.Public;
  private fileStorageOptions: FileStorageOptions = {
    visibility: this.fileVisibility,
    storageFolder: 'profiles',
  };
  constructor(private readonly prismaService: PrismaService) {}

  async get(user_id: string): Promise<UserModel> {
    const user = await this.prismaService.user.findUnique({
      where: {
        user_id,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    user_id: string,
    data: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        user_id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.password) {
      data.password = await this.hashPassword(data.password, user.salt);
    }
    try {
      const transaction = await this.prismaService.$transaction(
        async (prisma) => {
          if (data.profile !== user.profile && file) {
            data.profile = await uploadFile(file, this.fileStorageOptions);
          }

          if (user.profile) {
            await deleteFile(user.profile, this.fileStorageOptions);
          }

          return await prisma.user.update({
            where: {
              user_id: user.user_id,
            },
            data,
          });
        },
      );
      return transaction;
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
