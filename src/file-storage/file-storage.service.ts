import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getFile, getFiles } from '../common/utils/file-storage';
import { FileStorageOptions } from '@src/file-storage/types';
import { FileVisibility } from '@prisma/client';

@Injectable()
export class FileStorageService {
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
}
