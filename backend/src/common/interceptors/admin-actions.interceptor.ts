import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminActionsLog, AdminActionType } from '../../modules/admin-actions-log/schemas/admin-actions-log.schema';

@Injectable()
export class AdminActionsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AdminActionsInterceptor.name);

  constructor(
    @InjectModel(AdminActionsLog.name) private readonly adminLogModel: Model<AdminActionsLog>
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const originalUrl = req.originalUrl || req.url;

    return next.handle().pipe(
      tap((res) => {
        // Only log requests made by ADMIN that mutate data
        const adminId = req.user?._id || req.user?.id || req.user?.sub;
        const isAdmin = req.user?.roleName === 'ADMIN';

        if (isAdmin && adminId && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
          let actionType = AdminActionType.UPDATE;
          if (method === 'POST') actionType = AdminActionType.CREATE;
          if (method === 'DELETE') actionType = AdminActionType.DELETE;

          // Extract entity name from URL, e.g., /api/v1/jobs -> jobs
          const urlParts = originalUrl.split('?')[0].split('/').filter(Boolean);
          let targetEntity = 'Unknown';
          
          // Try to find a meaningful entity name in the URL
          const apiIndex = urlParts.indexOf('api');
          const v1Index = urlParts.indexOf('v1');
          
          if (v1Index !== -1 && urlParts[v1Index + 1]) {
             // e.g. /api/v1/admin/job-roles -> job-roles
             if (urlParts[v1Index + 1] === 'admin' && urlParts[v1Index + 2]) {
                 targetEntity = urlParts[v1Index + 2];
             } else {
                 // e.g. /api/v1/jobs -> jobs
                 targetEntity = urlParts[v1Index + 1];
             }
          }

          // Don't log overview or other read-only sounding endpoints that might somehow be POST
          if (['overview', 'dashboard', 'auth'].includes(targetEntity)) return;

          this.adminLogModel.create({
            adminId,
            actionType,
            targetEntity,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          }).catch(err => this.logger.error('Failed to log admin action', err));
        }
      })
    );
  }
}
