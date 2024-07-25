import { Injectable, ValidationPipe, ValidationError } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { error } from 'console';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  protected exceptionFactory = (
    validationErrors: ValidationError[] = [],
  ): HttpException => {
    const errors = validationErrors.flatMap((error) =>
      Object.values(error.constraints),
    );

    return new HttpException(
      {
        errors,
        error: 'Bad Request',
        message: 'Validation failed',
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST,
    );
  };
}
