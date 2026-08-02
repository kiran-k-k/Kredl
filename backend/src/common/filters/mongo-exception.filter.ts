/**
 * MongoExceptionFilter — maps MongoDB driver errors to meaningful HTTP responses.
 *
 * Registered as a global filter in `main.ts` (before `AllExceptionsFilter`).
 * Catches any error that carries a `code` property matching known MongoDB
 * error codes without importing the mongodb driver directly (avoids peer-dep
 * resolution issues in pnpm workspaces).
 *
 * Currently handles:
 *   - Error code 11000 (duplicate key) → 409 Conflict
 *
 * The conflicting field name is extracted from `error.keyValue` and included
 * in the response body so the client knows which field caused the conflict
 * without having to parse a raw MongoDB error string.
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/** Shape of a MongoDB Server Error as seen through Mongoose. */
interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

@Catch()
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongoExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const err = exception as MongoError;

    // Only handle errors that look like MongoDB server errors
    if (!this.isMongoError(err)) {
      // Let the next filter (AllExceptionsFilter) handle non-Mongo errors.
      // Re-throw is not supported in global filters — pass through by
      // calling the next response ourselves with INTERNAL_SERVER_ERROR.
      // This branch should never be reached when filters are ordered correctly.
      return;
    }

    if (err.code === 11000) {
      const conflictingFields = this.extractConflictingFields(err);
      const message =
        conflictingFields.length > 0
          ? `A record with the same ${conflictingFields.join(', ')} already exists.`
          : 'A record with duplicate key values already exists.';

      this.logger.warn(`Duplicate key conflict: ${message}`);

      response.status(HttpStatus.CONFLICT).json({
        success: false,
        statusCode: HttpStatus.CONFLICT,
        message,
        conflictingFields,
      });
      return;
    }

    // Unknown Mongo error
    this.logger.error(
      `Unhandled MongoDB error code=${err.code}: ${err.message}`,
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected database error occurred.',
    });
  }

  /** Returns true when the exception looks like a MongoDB server error. */
  private isMongoError(err: unknown): err is MongoError {
    return (
      err instanceof Error &&
      'code' in err &&
      typeof (err as MongoError).code === 'number' &&
      // MongoServerError name as set by the mongodb driver
      (err.name === 'MongoServerError' || err.name === 'BulkWriteError')
    );
  }

  /** Extracts field names from the `keyValue` property of a duplicate-key error. */
  private extractConflictingFields(err: MongoError): string[] {
    try {
      if (err.keyValue && typeof err.keyValue === 'object') {
        return Object.keys(err.keyValue);
      }
    } catch {
      // fall back to generic message
    }
    return [];
  }
}
