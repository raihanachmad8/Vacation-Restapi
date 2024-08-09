import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  deleteFile,
  generateFileUrl,
  getFile,
  getFiles,
  uploadFile,
} from '../common/utils/file-storage';
import { FileStorageOptions } from '@src/file-storage/types';
import { FileVisibility, User } from '@prisma/client';
import { PrismaService } from '@src/prisma/prisma.service';
import { ValidationService } from '@src/common/validation.service';
import { FileStorageValidation } from './file-storage.validation';
import { FileRequest } from './dto';

@Injectable()
export class FileStorageService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}
  public static PUBLIC = (storageFolder: string): FileStorageOptions => ({
    visibility: FileVisibility.PUBLIC,
    storageFolder,
  });

  public static PRIVATE = (storageFolder: string): FileStorageOptions => ({
    visibility: FileVisibility.PRIVATE,
    storageFolder,
  });

  async getFile(
    filename: string,
    fileStorageOptions: FileStorageOptions,
  ): Promise<Buffer> {
    try {
      return await getFile(filename, fileStorageOptions);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching file: ${error.message}`,
      );
    }
  }

  async getFiles(
    filenames: string[],
    fileStorageOptions: FileStorageOptions,
  ): Promise<Buffer[]> {
    try {
      return await getFiles(filenames, fileStorageOptions);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching files: ${error.message}`,
      );
    }
  }

  async uploadFile(
    file: FileRequest,
    fileStorageOptions: FileStorageOptions,
  ): Promise<string> {
    console.log(file);
    const validatedFile = this.validationService.validate(
      FileStorageValidation.FILE_STORAGE_REQUEST,
      file,
    );

    let filename: string;

    try {
      filename = await uploadFile(validatedFile.file, fileStorageOptions);

      const fileUrl = await this.prismaService.$transaction(async (prisma) => {
        await prisma.file.create({
          data: {
            filename,
            visibility: fileStorageOptions.visibility,
            User: {
              connect: {
                user_id: file.user_id,
              },
            },
          },
        });

        return generateFileUrl(filename, fileStorageOptions);
      });

      return fileUrl;
    } catch (error) {
      if (filename) {
        await deleteFile(filename, fileStorageOptions);
      }
      throw new InternalServerErrorException(
        `Error uploading file: ${error.message}`,
      );
    }
  }

  async deleteFile(
    filename: string,
    fileStorageOptions: FileStorageOptions,
    user: User,
  ): Promise<void> {
    try {
      const file = await this.prismaService.file.findMany({
        where: {
          filename,
          user_id: user.user_id,
        },
      });

      if (file.length === 0) {
        throw new InternalServerErrorException(
          `File not found in database: ${filename}`,
        );
      }
      await deleteFile(filename, fileStorageOptions);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error deleting file: ${error.message}`,
      );
    }
  }
}
