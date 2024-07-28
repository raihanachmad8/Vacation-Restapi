import { FileVisibility } from '@prisma/client';
import { FileStorageOptions } from 'src/file-storage/types';

export const profileStorageConfig: FileStorageOptions = {
  visibility: FileVisibility.Public,
  storageFolder: 'profiles',
};

export const articleStorageConfig: FileStorageOptions = {
  visibility: FileVisibility.Public,
  storageFolder: 'articles',
};
