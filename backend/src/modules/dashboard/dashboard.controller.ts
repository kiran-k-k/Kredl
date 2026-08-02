import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { RecommendationService } from './recommendation.service';
import { DashboardFacadeService } from './dashboard-facade.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import {
  RecommendedCoursesResponseDto,
  ActivityResponseDto,
  ActivityQueryDto,
  NotificationQueryDto,
  NotificationListDto,
  ProgressSummaryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { ContinueLearningDto } from './dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly recommendationService: RecommendationService,
    private readonly notificationsService: NotificationsService,
    private readonly dashboardFacadeService: DashboardFacadeService,
  ) {}

  @Get()
  @Roles(RoleEnum.STUDENT)
  @HttpCode(HttpStatus.OK)
  async getDashboard(
    @CurrentUser() user: { sub: string; roleId: string },
  ): Promise<ApiResponseDto<DashboardResponseDto>> {
    const data = await this.dashboardFacadeService.getDashboard(
      user.sub,
      user.roleId,
    );
    return {
      success: true,
      message: 'Dashboard fetched successfully',
      data,
      timestamp: new Date(),
    };
  }

  @Get('continue-learning')
  async getContinueLearning(
    @CurrentUser() user: { sub: string },
  ): Promise<ApiResponseDto<{ continueLearning: ContinueLearningDto | null }>> {
    const data = await this.dashboardService.getContinueLearning(user.sub);
    return {
      success: true,
      message: 'Continue learning fetched successfully',
      data: { continueLearning: data },
      timestamp: new Date(),
    };
  }

  @Get('recommended')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getRecommendedCourses(
    @CurrentUser() user: { sub: string },
  ): Promise<ApiResponseDto<RecommendedCoursesResponseDto>> {
    const recommendations = await this.recommendationService.getRecommendations(
      user.sub,
    );

    return {
      success: true,
      message: 'Recommendations fetched successfully',
      data: recommendations,
      timestamp: new Date(),
    };
  }

  @Get('progress')
  @Roles(RoleEnum.STUDENT)
  @HttpCode(HttpStatus.OK)
  async getProgressSummary(
    @CurrentUser() user: { sub: string },
  ): Promise<ApiResponseDto<ProgressSummaryDto>> {
    const summary = await this.dashboardService.getProgressSummary(user.sub);
    return {
      success: true,
      message: 'Progress summary fetched successfully',
      data: summary,
      timestamp: new Date(),
    };
  }

  @Get('activity')
  @Roles(RoleEnum.STUDENT)
  @HttpCode(HttpStatus.OK)
  async getRecentActivity(
    @CurrentUser() user: { sub: string },
    @Query() query: ActivityQueryDto,
  ): Promise<ApiResponseDto<ActivityResponseDto>> {
    const activity = await this.dashboardService.getRecentActivity(
      user.sub,
      query,
    );
    return {
      success: true,
      message: 'Recent activity fetched successfully',
      data: activity,
      timestamp: new Date(),
    };
  }

  @Get('notifications')
  @Roles(RoleEnum.STUDENT)
  @HttpCode(HttpStatus.OK)
  async getNotifications(
    @CurrentUser() user: { sub: string; roleId: string },
    @Query() query: NotificationQueryDto,
  ): Promise<ApiResponseDto<NotificationListDto>> {
    const data = await this.notificationsService.getUserNotifications(
      user.sub,
      query,
    );
    return {
      success: true,
      message: 'Notifications fetched successfully',
      data,
      timestamp: new Date(),
    };
  }
}
