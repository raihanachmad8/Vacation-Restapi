import { z, ZodType } from 'zod';
import { FileRequest } from './dto';

const MulterFileSchema = z.object({
  fieldname: z.string(),
  originalname: z
    .string()
    .regex(/\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/),
  encoding: z.string(),
  mimetype: z.string(),
  buffer: z.instanceof(Buffer),
  size: z.number().max(5 * 1024 * 1024), // 5MB
  stream: z.any().optional(),
  destination: z.string().optional(),
  filename: z.string().optional(),
  path: z.string().optional(),
});

export class FileStorageValidation {
  static readonly FILE_STORAGE_REQUEST: ZodType<FileRequest> = z.object({
    file: MulterFileSchema,
    user_id: z.string().uuid(),
  }) as ZodType<FileRequest>;
}
