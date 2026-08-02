import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { RecommendationService } from './recommendation.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { DASHBOARD_CONFIG } from '../../config/dashboard.config';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@Injectable()
export class DashboardFacadeService {
  private readonly logger = new Logger(DashboardFacadeService.name);

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly recommendationService: RecommendationService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  async getDashboard(
    userId: string,
    roleId?: string,
  ): Promise<DashboardResponseDto> {
    const start = Date.now();

    // Execute independent database operations concurrently
    const [
      profile,
      continueLearning,
      recommendedCourses,
      progress,
      recentActivityResult,
      notifications,
    ] = await Promise.all([
      this.usersService.getDashboardProfile(userId),
      DASHBOARD_CONFIG.continueLearningEnabled
        ? this.dashboardService.getContinueLearning(userId)
        : Promise.resolve(null),
      this.recommendationService.getRecommendations(userId),
      this.dashboardService.getProgressSummary(userId),
      this.dashboardService.getRecentActivity(userId, {
        limit: DASHBOARD_CONFIG.activityLimit,
      }),
      this.notificationsService.getLatestNotifications(
        userId,
        DASHBOARD_CONFIG.notificationLimit,
      ),
    ]);

    if (!profile) {
      throw new NotFoundException(`Profile not found for user ${userId}`);
    }

    // Format recommended courses based on existing RecommendationService output
    // Assuming we want a specific subset or limit, or we just take topCourses
    // getRecommendations currently returns RecommendedCoursesResponseDto which has topCourses, newestCourses, etc.
    // The requirement says "RecommendedCourseDto[]". So we'll flatten topCourses up to the limit.
    const allRecommendations = [
      ...(recommendedCourses.roleBasedCourses || []),
      ...(recommendedCourses.skillBasedCourses || []),
      ...(recommendedCourses.topCourses || []),
      ...(recommendedCourses.newestCourses || []),
    ];

    // Remove duplicates by courseId
    const seen = new Set<string>();
    const uniqueRecommendations = allRecommendations.filter((course) => {
      if (seen.has(course.courseId)) return false;
      seen.add(course.courseId);
      return true;
    });

    const finalRecommendations = uniqueRecommendations.slice(
      0,
      DASHBOARD_CONFIG.recommendedLimit,
    );

    const durationMs = Date.now() - start;
    this.logger.debug(
      `[getDashboard] Aggregation completed in ${durationMs}ms for user ${userId}`,
    );

    return {
      profile,
      continueLearning,
      recommendedCourses: finalRecommendations,
      progress,
      recentActivity: recentActivityResult.activities,
      notifications,
      generatedAt: new Date(),
    };
  }
}
