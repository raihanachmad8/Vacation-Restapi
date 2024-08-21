import { generateFileUrl } from '@src/common/utils';
import { UserModel } from './user';
import { HiddenGemsCommentModel } from './hidden-gems-comment.model';
import { OperatingDaysAndHours } from '@prisma/client';
import { hiddenGemsStorageConfig } from '@root/config/storage.config';

export class HiddenGemsModel {
  hidden_gem_id: string;
  title: string;
  price_start: number;
  price_end: number;
  location: string;
  rating: number = 0;
  isRated: boolean = false;
  category: any;
  status: string;
  description: string;
  photos: string[];
  user: UserModel;
  operation_days: OperatingDaysAndHours[];
  comment: HiddenGemsCommentModel[];
  created_at: Date;
  updated_at: Date;

  static async toJson(
    partial: Partial<any>,
    options?: {
      marked_user_id?: string;
      rating?: number;
    },
  ) {
    const hiddenGems = new HiddenGemsModel();
    partial.hidden_gem_id && (hiddenGems.hidden_gem_id = partial.hidden_gem_id);
    partial.title && (hiddenGems.title = partial.title);
    partial.price_start && (hiddenGems.price_start = partial.price_start);
    partial.price_end && (hiddenGems.price_end = partial.price_end);
    partial.location && (hiddenGems.location = partial.location);
    options?.rating && (hiddenGems.rating = options.rating);
    partial.HiddenGemsCategory &&
      (hiddenGems.category = partial.HiddenGemsCategory);
    partial.status && (hiddenGems.status = partial.status);
    partial.description && (hiddenGems.description = partial.description);
    partial.User && (hiddenGems.user = await UserModel.toJson(partial.User));
    partial.Photos &&
      (hiddenGems.photos = await Promise.all(
        partial.Photos.map((photo: any) =>
          generateFileUrl(photo.filename, hiddenGemsStorageConfig),
        ),
      ));
    partial.HiddenGemsComment &&
      (hiddenGems.comment = await Promise.all(
        partial.HiddenGemsComment.map((comment: any) =>
          HiddenGemsCommentModel.toJson(comment),
        ),
      ));
    partial.OperatingDaysAndHours &&
      (hiddenGems.operation_days = partial.OperatingDaysAndHours);
    partial.created_at && (hiddenGems.created_at = partial.created_at);

    if (options.marked_user_id) {
      hiddenGems.isRated = partial.HiddenGemsRating.some(
        (rating: any) => rating.user_id === options.marked_user_id,
      );
    }

    return hiddenGems;
  }
}
