import { Injectable, ValidationPipe, ValidationError } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';

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
        message: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST,
    );
  };
}
