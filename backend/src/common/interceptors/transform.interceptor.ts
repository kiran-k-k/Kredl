/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already contains a 'success' field, it might be already formatted
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Handle PaginatedResult shape
        if (data && typeof data === 'object' && 'pagination' in data && 'data' in data) {
          return {
            success: true,
            message: 'Operation completed successfully',
            data: data.data,
            pagination: data.pagination,
          };
        }

        // Handle { data, total } or { data, totalItems } shape
        if (data && typeof data === 'object' && 'data' in data && !('pagination' in data)) {
          if ('total' in data || 'totalItems' in data) {
            const total = data.total ?? data.totalItems ?? 0;
            const page = data.currentPage ?? data.page ?? 1;
            const limit = data.itemsPerPage ?? data.limit ?? total;
            const computedPages = Math.ceil(total / (limit || 1)) || 1;
            const totalPages = data.totalPages ?? computedPages;
            
            return {
              success: true,
              message: 'Operation completed successfully',
              data: data.data,
              pagination: {
                page,
                limit,
                total,
                totalPages
              },
            };
          }
        }

        return {
          success: true,
          message: 'Operation completed successfully',
          data: data !== undefined ? data : {},
        };
      }),
    );
  }
}
