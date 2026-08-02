import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from '../../users/schemas/user.schema';
import { PlacementDrive } from '../../placement-drives/schemas/placement-drive.schema';
import {
  Application,
  ApplicationStatus,
} from '../../applications/schemas/application.schema';
import { RoleEnum } from '../../roles/schemas/role.schema';
import { TpoDashboardResponseDto } from '../dto/tpo-dashboard-response.dto';
import { AdminActionsLog } from '../../admin-actions-log/schemas/admin-actions-log.schema';

@Injectable()
export class TpoDashboardService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(PlacementDrive.name)
    private readonly driveModel: Model<PlacementDrive>,
    @InjectModel(Application.name)
    private readonly applicationModel: Model<Application>,
    @InjectModel(AdminActionsLog.name)
    private readonly adminLogModel: Model<AdminActionsLog>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getDashboardOverview(): Promise<TpoDashboardResponseDto> {
    const cacheKey = 'tpo-dashboard-overview';
    const cachedData =
      await this.cacheManager.get<TpoDashboardResponseDto>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Use Promise.all to fetch all required statistics in parallel
    const [totalStudents, placedStudents, activeDrives, recentLogs] =
      await Promise.all([
        this.userModel.countDocuments({ role: RoleEnum.STUDENT }),
        this.applicationModel.countDocuments({
          status: ApplicationStatus.SELECTED,
        }),
        this.driveModel.countDocuments({ driveStatus: 'ongoing' }),
        this.adminLogModel.find().sort({ createdAt: -1 }).limit(5).lean(),
      ]);

    // Calculate placement rate
    const placementRateRaw =
      totalStudents > 0 ? (placedStudents / totalStudents) * 100 : 0;
    const placementRate = placementRateRaw.toFixed(1) + '%';

    // Map logs to recent activity format
    const recentActivity = recentLogs.map((log: any) => {
      let type: 'drive' | 'student' | 'announcement' = 'student';
      if (log.targetEntity && log.targetEntity.toLowerCase().includes('drive'))
        type = 'drive';
      if (
        log.targetEntity &&
        log.targetEntity.toLowerCase().includes('announcement')
      )
        type = 'announcement';

      return {
        id: log._id.toString(),
        type,
        title: `${log.actionType} ${log.targetEntity || 'Entity'}`,
        description: log.metadata?.details || `TPO action performed`,
        timestamp: this.formatTimeAgo(log.createdAt || new Date()),
      };
    });

    const response: TpoDashboardResponseDto = {
      stats: {
        totalStudents,
        placedStudents,
        placementRate,
        activeDrives,
      },
      recentActivity,
    };

    // Cache the aggregated payload for 60 seconds
    await this.cacheManager.set(cacheKey, response, 60000);

    return response;
  }

  private formatTimeAgo(date: Date): string {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000,
    );
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' mins ago';
    return Math.floor(seconds) + ' seconds ago';
  }
}
