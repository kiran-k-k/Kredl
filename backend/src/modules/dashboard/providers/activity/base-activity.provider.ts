import {
  ActivityQueryDto,
  RecentActivityDto,
} from '../../dto/recent-activity.dto';
import { IActivityProvider } from '../../interfaces/activity-provider.interface';

export abstract class BaseActivityProvider implements IActivityProvider {
  protected getLimit(query: ActivityQueryDto): number {
    return query.limit || 20;
  }

  protected getDateMatch(
    query: ActivityQueryDto,
    dateField: string,
  ): Record<string, any> {
    const match: Record<string, any> = {};
    if (query.fromDate) match.$gte = new Date(query.fromDate);
    if (query.toDate) match.$lte = new Date(query.toDate);
    if (query.cursor) {
      if (query.sortDirection === 'asc') match.$gt = new Date(query.cursor);
      else match.$lt = new Date(query.cursor);
    }
    return Object.keys(match).length > 0 ? { [dateField]: match } : {};
  }

  protected getSortDirection(query: ActivityQueryDto): 1 | -1 {
    return query.sortDirection === 'asc' ? 1 : -1;
  }

  abstract getActivities(
    userId: string,
    query: ActivityQueryDto,
  ): Promise<RecentActivityDto[]>;
}
