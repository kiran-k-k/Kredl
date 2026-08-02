import {
  ActivityQueryDto,
  RecentActivityDto,
} from '../dto/recent-activity.dto';

export const ACTIVITY_PROVIDERS = 'ACTIVITY_PROVIDERS';

export interface IActivityProvider {
  /**
   * Fetches activities for a user based on the provided query.
   * Expected to respect the query's limit and sort direction if possible,
   * though the service will do a final merge and limit.
   */
  getActivities(
    userId: string,
    query: ActivityQueryDto,
  ): Promise<RecentActivityDto[]>;
}
