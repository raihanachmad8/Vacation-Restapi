import { eventStorageConfig, generateFileUrl } from '@src/common/utils';
import { UserModel } from './user';
import { OperationDay } from '@src/event/types';

export class EventModel {
  event_id: string;
  title: string;
  price_start: number;
  price_end: number;
  location: string;
  rating: number;
  category: any;
  status: string;
  description: string;
  photos: string[];
  user: UserModel;
  operation_days: OperationDay[];
  created_at: Date;
  updated_at: Date;

  static async toJson(partial: Partial<any>) {
    const event = new EventModel();
    partial.event_id && (event.event_id = partial.event_id);
    partial.title && (event.title = partial.title);
    partial.price_start && (event.price_start = partial.price_start);
    partial.price_end && (event.price_end = partial.price_end);
    partial.location && (event.location = partial.location);
    partial.rating && (event.rating = partial.rating);
    partial.EventCategory && (event.category = partial.EventCategory);
    partial.status && (event.status = partial.status);
    partial.description && (event.description = partial.description);
    partial.User && (event.user = await UserModel.toJson(partial.User));
    partial.Photos &&
      (event.photos = await Promise.all(
        partial.Photos.map((photo: any) =>
          generateFileUrl(photo.filename, eventStorageConfig),
        ),
      ));
    partial.EventOperatingDaysAndHours &&
      (event.operation_days = partial.EventOperatingDaysAndHours);
    partial.created_at && (event.created_at = partial.created_at);

    return event;
  }
}
