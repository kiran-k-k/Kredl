import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User, UserStatus } from '../../users/schemas/user.schema';
import { Course } from '../../courses/schemas/course.schema';
import { CourseModule } from '../../modules/schemas/module.schema';
import { Lesson } from '../../lessons/schemas/lesson.schema';
import { LessonNote } from '../../lesson-notes/schemas/lesson-note.schema';
import { AdminActionsLog } from '../../admin-actions-log/schemas/admin-actions-log.schema';
import { DatabaseHealthService } from '../../database-health/database-health.service';
import { AdminDashboardResponseDto } from '../dto/admin-dashboard-response.dto';
import { RoleEnum } from '../../roles/schemas/role.schema';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(CourseModule.name)
    private readonly moduleModel: Model<CourseModule>,
    @InjectModel(Lesson.name) private readonly lessonModel: Model<Lesson>,
    @InjectModel(LessonNote.name)
    private readonly lessonNoteModel: Model<LessonNote>,
    @InjectModel(AdminActionsLog.name)
    private readonly adminLogModel: Model<AdminActionsLog>,
    private readonly dbHealthService: DatabaseHealthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getDashboardOverview(): Promise<AdminDashboardResponseDto> {

    // Execute aggregate queries in parallel
    const [
      usersCount,
      coursesCount,
      modulesCount,
      lessonsCount,
      notesCount,
      dbHealth,
      recentLogs,
    ] = await Promise.all([
      this.userModel.countDocuments({ status: { $ne: UserStatus.DELETED } }),
      this.courseModel.countDocuments({ isDeleted: false }),
      this.moduleModel.countDocuments({ isDeleted: false }),
      this.lessonModel.countDocuments({ isDeleted: false }),
      this.lessonNoteModel.countDocuments({ isDeleted: false }),
      this.dbHealthService.checkLive(),
      this.adminLogModel
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('adminId', 'firstName lastName email')
        .exec(),
    ]);

    // Map logs to UI friendly format
    const recentActivity = recentLogs.map((log: any) => {
      let title = log.actionType;
      let color = 'bg-primary';
      const icon = 'UserPlus';

      switch (log.actionType) {
        case 'CREATE':
          color = 'bg-success';
          title = `New ${log.targetEntity} created`;
          break;
        case 'UPDATE':
          color = 'bg-warning';
          title = `${log.targetEntity} updated`;
          break;
        case 'DELETE':
          color = 'bg-destructive';
          title = `${log.targetEntity} deleted`;
          break;
        case 'LOGIN':
          color = 'bg-blue-500';
          title = 'Admin login';
          break;
      }

      const adminName = log.adminId
        ? `${log.adminId.firstName || ''} ${log.adminId.lastName || ''}`.trim()
        : 'System';
      const adminEmail = log.adminId?.email || '';

      // Format time elapsed
      const timeDiff = Math.floor(
        (new Date().getTime() - new Date(log.createdAt).getTime()) / 1000 / 60,
      ); // minutes
      let timeStr = `${timeDiff} mins ago`;
      if (timeDiff > 60) {
        const hours = Math.floor(timeDiff / 60);
        timeStr = `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (hours > 24) {
          const days = Math.floor(hours / 24);
          timeStr = `${days} day${days > 1 ? 's' : ''} ago`;
        }
      } else if (timeDiff === 0) {
        timeStr = 'Just now';
      }

      return {
        type: log.actionType,
        title,
        description: `${adminName} (${adminEmail}) performed action on ${log.targetEntity}`,
        time: timeStr,
        color,
      };
    });

    const responseData: AdminDashboardResponseDto = {
      stats: {
        users: usersCount,
        courses: coursesCount,
        modules: modulesCount,
        lessons: lessonsCount,
        notes: notesCount,
      },
      recentActivity,
      system: {
        status: dbHealth.status,
        database: dbHealth.connection?.state === 'connected' ? 'Connected' : 'Error',
        api: 'Operational',
        environment: process.env.NODE_ENV || 'development',
        lastChecked: new Date(),
      },
    };

    return responseData;
  }
}
