import { z, ZodType } from 'zod';
import { CreateEventRequest, UpdateEventRequest } from './dto';
import { eventFilter } from './types';
const OperationDaySchema = z.object({
  date: z.string().date(),
  open_time: z.string().datetime(),
  close_time: z.string().datetime(),
});

const MulterFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string().regex(/\.(jpg|jpeg|png)$/i),
  encoding: z.string(),
  mimetype: z.string(),
  buffer: z.instanceof(Buffer),
  size: z.number().max(5 * 1024 * 1024), // 5MB
  stream: z.any().optional(),
  destination: z.string().optional(),
  filename: z.string().optional(),
  path: z.string().optional(),
});

export class EventValidation {
  static readonly CREATE_EVENT_REQUEST: ZodType<CreateEventRequest> = z.object({
    title: z.string().min(3),
    price_start: z.number().int().min(0),
    price_end: z.number().int().min(0),
    location: z.string().min(3),
    rating: z.number().int().min(0).max(5),
    category_id: z.string().uuid(),
    operation_days: z.array(OperationDaySchema).nonempty(),
    description: z.string().min(10),
    photos: z.array(MulterFileSchema).nonempty(),
    user_id: z.string().uuid(),
  }) as ZodType<CreateEventRequest>;

  static readonly EVENT_FILTER: ZodType<eventFilter> = z.object({
    u: z.string().uuid().optional(),
    stat: z
      .array(z.enum(['APPROVE', 'PENDING', 'REJECT', 'REVISION']))
      .optional(),
    s: z.string().optional(),
    category_id: z.string().uuid().optional(),
    location: z.string().optional(),
    price_start: z.number().int().optional(),
    price_end: z.number().int().optional(),
    rating: z.number().int().optional(),
    limit: z.number().int().optional(),
    page: z.number().int().optional(),
    orderBy: z.string().optional(),
    order: z.string().optional(),
  }) as ZodType<eventFilter>;

  static readonly UPDATE_EVENT_REQUEST: ZodType<Partial<UpdateEventRequest>> =
    z.object({
      title: z.string().min(3).optional(),
      price_start: z.number().int().min(0).optional(),
      price_end: z.number().int().min(0).optional(),
      location: z.string().min(3).optional(),
      rating: z.number().int().min(0).max(5).optional(),
      category_id: z.string().uuid().optional(),
      operation_days: z.array(OperationDaySchema).nonempty().optional(),
      description: z.string().min(10).optional(),
      photos: z.array(MulterFileSchema).nonempty().optional(),
    }) as ZodType<Partial<UpdateEventRequest>>;
}
