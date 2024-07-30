import { FileVisibility } from '@prisma/client';
import { FileStorageOptions } from 'src/file-storage/types';

export const profileStorageConfig: FileStorageOptions = {
  visibility: FileVisibility.PUBLIC,
  storageFolder: 'profiles',
};

export const articleStorageConfig: FileStorageOptions = {
  visibility: FileVisibility.PUBLIC,
  storageFolder: 'articles',
};
