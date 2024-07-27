import { FileVisibility } from '@prisma/client';

export type FileStorageOptions = {
  visibility?: FileVisibility;
  storageFolder?: string;
};
