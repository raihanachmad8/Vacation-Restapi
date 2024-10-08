import { FileVisibility } from '@prisma/client';
import { FileStorageOptions } from '@src/file-storage/types';

export const profileStorageConfig: FileStorageOptions = {
  visibility: FileVisibility.PUBLIC,
  storageFolder: 'profiles',
};

export const articleStorageConfig: FileStorageOptions = {
  visibility: FileVisibility.PUBLIC,
  storageFolder: 'articles',
};

export const hiddenGemsStorageConfig: FileStorageOptions = {
  visibility: FileVisibility.PUBLIC,
  storageFolder: 'hidden-gems',
};

export const globalFileStorageConfig: FileStorageOptions = {
  visibility: FileVisibility.PUBLIC,
  storageFolder: 'file-storage',
};

export const eventStorageConfig: FileStorageOptions = {
  visibility: FileVisibility.PUBLIC,
  storageFolder: 'events',
};

export const kanbanBoardStorageConfig: FileStorageOptions = {
  visibility: FileVisibility.PUBLIC,
  storageFolder: 'kanban-board',
};

export const kanbanCardStorageConfig: FileStorageOptions = {
  visibility: FileVisibility.PUBLIC,
  storageFolder: 'kanban-card',
};
