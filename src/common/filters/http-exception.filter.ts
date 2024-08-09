import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { error } from 'console';
import { Response } from 'express';
import { ZodError } from 'zod';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    if (exception instanceof ZodError) {
      const errorResponse = {
        statusCode: 400,
        timestamp: new Date().toISOString(),
        message: 'Validation failed',
        error: 'Bad Request',
        errors: exception.errors,
      };

      response.status(400).json(errorResponse);
      return;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      ...(typeof exceptionResponse === 'object'
        ? exceptionResponse
        : { message: exceptionResponse }),
    };

    response.status(status).json(errorResponse);
  }
}
