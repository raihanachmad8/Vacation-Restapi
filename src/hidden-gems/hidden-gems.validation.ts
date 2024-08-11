import { z, ZodType } from 'zod';
import {
  CommentRequest,
  CreateHiddenGemsRequest,
  HiddenGemsCommentRepliesRequest,
} from './dto';
import { hiddenGemsFilter } from './types';
import { UpdateHiddenGemsRequest } from './dto/update.dto';

const DayOfWeek = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);

const OperationDaySchema = z.object({
  day: DayOfWeek,
  open_time: z.string().length(5),
  close_time: z.string().length(5),
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

export class HiddenGemsValidation {
  static readonly CREATE_HIDDEN_GEMS_REQUEST: ZodType<CreateHiddenGemsRequest> =
    z.object({
      title: z.string().min(3),
      price_start: z.number().int().min(0),
      price_end: z.number().int().min(0),
      location: z.string().min(3),
      rating: z.number().int().min(0).max(5),
      category_id: z.string().uuid(), // Category ID should be a string UUID
      operation_days: z
        .array(OperationDaySchema)
        .nonempty()
        .refine(
          (days) => {
            const seenDays = new Set<string>();
            for (const day of days) {
              if (seenDays.has(day.day)) {
                return false;
              }
              seenDays.add(day.day);
            }
            return true;
          },
          {
            message: 'Day in operation days must be unique',
          },
        ),
      description: z.string().min(10),
      photos: z.array(MulterFileSchema).nonempty(),
      user_id: z.string().uuid(),
    }) as ZodType<CreateHiddenGemsRequest>;

  static readonly HIDDEN_GEMS_FILTER: ZodType<hiddenGemsFilter> = z.object({
    u: z.string().uuid().optional(),
    stat: z
      .array(z.enum(['APPROVE', 'PENDING', 'REJECT', 'REVISION']))
      .optional(),
    stat_day: z.array(DayOfWeek).optional(),
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
  }) as ZodType<hiddenGemsFilter>;

  static readonly UPDATE_HIDDEN_GEMS_REQUEST: ZodType<
    Partial<UpdateHiddenGemsRequest>
  > = z.object({
    title: z.string().min(3).optional(),
    price_start: z.number().int().min(0).optional(),
    price_end: z.number().int().min(0).optional(),
    location: z.string().min(3).optional(),
    rating: z.number().int().min(0).max(5).optional(),
    category_id: z.string().uuid().optional(),
    operation_days: z
      .array(OperationDaySchema)
      .nonempty()
      .refine(
        (days) => {
          const seenDays = new Set<string>();
          for (const day of days) {
            if (seenDays.has(day.day)) {
              return false;
            }
            seenDays.add(day.day);
          }
          return true;
        },
        {
          message: 'Day in operation days must be unique',
        },
      )
      .optional(),
    description: z.string().min(10).optional(),
    photos: z.array(MulterFileSchema).nonempty().optional(),
  }) as ZodType<Partial<UpdateHiddenGemsRequest>>;

  static readonly HIDDEN_GEMS_COMMENT_REQUEST: ZodType<CommentRequest> =
    z.object({
      comment: z.string().min(3),
      hidden_gems_id: z.string().uuid(),
      rating: z.number().int().min(0).max(5),
      user_id: z.string().uuid(),
    }) as ZodType<CommentRequest>;

  static readonly HIDDEN_GEMS_COMMENT_REPLIES_REQUEST: ZodType<HiddenGemsCommentRepliesRequest> =
    z.object({
      comment_id: z.string().uuid(),
      parent_id: z.string().uuid().optional(),
      comment: z.string().min(3),
      rating: z.number().int().min(0).max(5),
      user_id: z.string().uuid(),
    }) as ZodType<HiddenGemsCommentRepliesRequest>;
}
