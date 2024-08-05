import { diskStorage } from 'multer';
import { promises as fsPromises } from 'fs';
import { dirname, extname, join } from 'path';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { FileStorageOptions } from '@src/file-storage/types';
import { InternalServerErrorException } from '@nestjs/common';
import { FileVisibility } from '@prisma/client';
import axios from 'axios';
import mime from 'mime-types';

const appUrl = process.env.APP_URL || 'http://localhost:3000';

function getBasePath(fileStorageOptions: FileStorageOptions): string {
  if (__dirname.includes('dist')) {
    return join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'storage',
      fileStorageOptions.visibility === FileVisibility.PUBLIC
        ? 'public'
        : 'private',
      fileStorageOptions.storageFolder || '',
    );
  }
  return join(
    __dirname,
    '..',
    '..',
    '..',
    'storage',
    fileStorageOptions.visibility === FileVisibility.PUBLIC
      ? 'public'
      : 'private',
    fileStorageOptions.storageFolder || '',
  );
}

export function createFileStorageConfig(
  fileStorageOptions: FileStorageOptions = {
    visibility: FileVisibility.PUBLIC,
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
    visibility: FileVisibility.PUBLIC,
    storageFolder: '',
  },
): Promise<string> {
  const basePath = getBasePath(fileStorageOptions);
  try {
    await fsPromises.unlink(join(basePath, filename));
    return `File ${filename} deleted successfully`;
  } catch (error) {
    return `Error deleting file: ${error.message}`;
  }
}

export async function deleteFiles(
  filenames: string[],
  fileStorageOptions: FileStorageOptions = {
    visibility: FileVisibility.PUBLIC,
    storageFolder: '',
  },
): Promise<string> {
  try {
    for (const filename of filenames) {
      await deleteFile(filename, fileStorageOptions);
    }
    return `Files deleted successfully`;
  } catch (error) {
    return `Error deleting files: ${error.message}`;
  }
}

export async function deleteAllFiles(
  fileStorageOptions: FileStorageOptions = {
    visibility: FileVisibility.PUBLIC,
    storageFolder: '',
  },
): Promise<string> {
  const basePath = getBasePath(fileStorageOptions);
  try {
    await fsPromises.rm(basePath, { recursive: true });
    return `All files deleted successfully`;
  } catch (error) {
    return `Error deleting all files: ${error.message}`;
  }
}

export async function getFile(
  filename: string,
  fileStorageOptions: FileStorageOptions = {
    visibility: FileVisibility.PUBLIC,
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
    visibility: FileVisibility.PUBLIC,
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
  fileStorageOptions: FileStorageOptions = {
    visibility: FileVisibility.PUBLIC,
    storageFolder: '',
  },
): Promise<string> {
  return `${appUrl}/api/storage/${fileStorageOptions.visibility ? 'public' : 'private'}/${fileStorageOptions.storageFolder}/${filename}`;
}

export async function uploadFile(
  file: Express.Multer.File | File,
  fileStorageOptions: FileStorageOptions = {
    visibility: FileVisibility.PUBLIC,
    storageFolder: '',
  },
  filename?: string,
): Promise<string> {
  const basePath = getBasePath(fileStorageOptions);
  try {
    const name = filename || (await generateRandomFileName(file));
    const filePath = join(basePath, name);
    await fsPromises.mkdir(dirname(filePath), { recursive: true });
    await fsPromises.writeFile(filePath, file.buffer);
    return name;
  } catch (error) {
    throw new InternalServerErrorException(
      `Error uploading file: ${error.message}`,
    );
  }
}

export async function uploadFiles(
  files: Express.Multer.File[],
  fileStorageOptions: FileStorageOptions = {
    visibility: FileVisibility.PUBLIC,
    storageFolder: '',
  },
): Promise<string[]> {
  const filenames: string[] = [];
  try {
    for (const file of files) {
      const filename = await uploadFile(file, fileStorageOptions);
      filenames.push(filename);
    }
    return filenames;
  } catch (error) {
    throw new InternalServerErrorException(
      `Error uploading files: ${error.message}`,
    );
  }
}

export async function generateRandomFileName(
  file: Express.Multer.File | File,
): Promise<string> {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  return `${uniqueSuffix}.${mime.extension(file.mimetype)}`;
}

interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export async function downloadAndSaveImage(
  imageUrl: string,
  fileStorageOptions: FileStorageOptions = {
    visibility: FileVisibility.PUBLIC,
    storageFolder: '',
  },
  filename?: string,
): Promise<string> {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const file: File = {
      fieldname: 'file',
      originalname: filename || imageUrl.split('/').pop() || 'unknown',
      encoding: 'binary',
      mimetype: response.headers['content-type'] || 'image/jpeg', // Default to 'image/jpeg' if mime type not found
      buffer: Buffer.from(response.data, 'binary'),
      size: response.data.length,
    };
    return await uploadFile(file, fileStorageOptions);
  } catch (error) {
    throw new InternalServerErrorException(
      `Error downloading and saving image: ${error.message}`,
    );
  }
}
