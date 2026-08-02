import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';

@Injectable()
export class SecurityLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const statusCode = res.statusCode;
        const contentLength = res.get('content-length') || '';
        const duration = Date.now() - startTime;

        this.logger.log(
          `${method} ${originalUrl} ${statusCode} ${contentLength} - ${duration}ms - IP: ${ip} - UA: ${userAgent}`,
        );
      }),
    );
  }
}
