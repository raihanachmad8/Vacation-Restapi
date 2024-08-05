import { Injectable } from '@nestjs/common';
import { ZodError, ZodType } from 'zod';

@Injectable()
export class ValidationService {
  validate<T>(zodType: ZodType<T>, data: T): T {
    // return zodType.parse(data);
    try {
      return zodType.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ZodError(error.errors);
      }
      throw error;
    }
  }
}
