/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        // Handle class-validator messages
        if (Array.isArray(exceptionResponse.message)) {
          message = 'Validation failed';
          errors = exceptionResponse.message;
        } else {
          message = exceptionResponse.message || message;
        }
      }
    } else if (exception instanceof Error) {
      // General Error (non-HTTP)
      message = exception.message;
      console.error('[AllExceptionsFilter] 500 Error:', exception);
    }

    response.status(status).json({
      success: false,
      message: message,
      errors: errors,
    });
  }
}
