import { diskStorage } from 'multer';
import { promises as fsPromises } from 'fs';
import { extname, join } from 'path';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { FileStorageOptions } from 'src/file-storage/types';
import { InternalServerErrorException } from '@nestjs/common';
import { FileVisibility } from '@prisma/client';

function getBasePath(fileStorageOptions: FileStorageOptions): string {
  return join(
    __dirname,
    '..',
    '..',
    '..',
    'storage',
    fileStorageOptions.visibility === FileVisibility.Public
      ? 'public'
      : 'private',
    fileStorageOptions.storageFolder || '',
  );
}

export function createFileStorageConfig(
  fileStorageOptions: FileStorageOptions = {
    visibility: FileVisibility.Public,
    storageFolder: '',
  },
): MulterOptions {
  const basePath = getBasePath(fileStorageOptions);
  return {
    storage: diskStorage({
      destination: async (req, file, cb) => {
        try {
          await fsPromises.mkdir(basePath, { recursive: true });
          cb(null, basePath);
        } catch (error) {
          cb(error, basePath);
        }
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = `${uniqueSuffix}${extname(file.originalname)}`;
        cb(null, filename);
      },
    }),
  };
}

export async function deleteFile(
  filename: string,
  fileStorageOptions: FileStorageOptions = {
    visibility: FileVisibility.Public,
    storageFolder: '',
  },
): Promise<string> {
  const basePath = getBasePath(fileStorageOptions);
  try {
    await fsPromises.unlink(join(basePath, filename));
    return `File ${filename} deleted successfully`;
  } catch (error) {
    throw new InternalServerErrorException(
      `Error deleting file: ${error.message}`,
    );
  }
}

export async function deleteFiles(
  filenames: string[],
  fileStorageOptions: FileStorageOptions = {
    visibility: FileVisibility.Public,
    storageFolder: '',
  },
): Promise<string> {
  try {
    for (const filename of filenames) {
      await deleteFile(filename, fileStorageOptions);
    }
    return `Files deleted successfully`;
  } catch (error) {
    throw new InternalServerErrorException(
      `Error deleting files: ${error.message}`,
    );
  }
}

export async function getFile(
  filename: string,
  fileStorageOptions: FileStorageOptions = {
    visibility: FileVisibility.Public,
    storageFolder: '',
  },
): Promise<Buffer> {
  const basePath = getBasePath(fileStorageOptions);
  try {
    return await fsPromises.readFile(join(basePath, filename));
  } catch (error) {
    throw new InternalServerErrorException(
      `Error fetching file: ${error.message}`,
    );
  }
}

export async function getFiles(
  filenames: string[],
  fileStorageOptions: FileStorageOptions = {
    visibility: FileVisibility.Public,
    storageFolder: '',
  },
): Promise<Buffer[]> {
  const files: Buffer[] = [];
  try {
    for (const filename of filenames) {
      const file = await getFile(filename, fileStorageOptions);
      files.push(file);
    }
    return files;
  } catch (error) {
    throw new InternalServerErrorException(
      `Error fetching files: ${error.message}`,
    );
  }
}

export async function generateFileUrl(
  filename: string,
  appUrl: string,
  fileStorageOptions: FileStorageOptions = {
    visibility: FileVisibility.Public,
    storageFolder: '',
  },
): Promise<string> {
  return `${appUrl}/api/storage/${fileStorageOptions.visibility ? 'public' : 'private'}/${fileStorageOptions.storageFolder}/${filename}`;
}
