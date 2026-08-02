import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { NotificationType, NotificationCategory } from './schemas/notification.schema';

@Injectable()
export class NotificationsListener {
  private readonly logger = new Logger(NotificationsListener.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('user.registered')
  async handleUserRegistered(user: any) {
    try {
      await this.notificationsService.createNotification({
        userId: user._id || user.id,
        type: NotificationType.WELCOME,
        category: NotificationCategory.SYSTEM,
        title: 'Welcome to Kredl!',
        message: 'We are excited to have you on board. Start exploring our learning and placement modules today!',
      });
    } catch (error) {
      this.logger.error('Failed to handle user.registered event', error.stack);
    }
  }

  @OnEvent('course.completed')
  async handleCourseCompleted(payload: { userId: string; courseId: string; courseTitle: string }) {
    try {
      await this.notificationsService.createNotification({
        userId: payload.userId,
        type: NotificationType.COURSE_COMPLETED,
        category: NotificationCategory.LEARNING,
        title: 'Course Completed!',
        message: `Congratulations on completing the course: ${payload.courseTitle || 'Course'}.`,
        metadata: { courseId: payload.courseId },
      });
    } catch (error) {
      this.logger.error('Failed to handle course.completed event', error.stack);
    }
  }

  @OnEvent('module.published')
  async handleModulePublished(payload: { moduleId: string; moduleTitle: string; courseId: string }) {
    try {
      // Create a global notification for all students (assuming enrolled students later if needed)
      await this.notificationsService.createSystemNotification({
        targetAudience: 'ALL_STUDENTS' as any,
        type: NotificationType.NEW_MODULE,
        category: NotificationCategory.LEARNING,
        title: 'New Module Available',
        message: `A new module "${payload.moduleTitle}" has been added to the platform.`,
        metadata: { moduleId: payload.moduleId, courseId: payload.courseId },
      });
    } catch (error) {
      this.logger.error('Failed to handle module.published event', error.stack);
    }
  }

  @OnEvent('company.created')
  async handleCompanyCreated(payload: { companyId: string; companyName: string }) {
    try {
      await this.notificationsService.createSystemNotification({
        targetAudience: 'ALL_STUDENTS' as any,
        type: NotificationType.NEW_COMPANY,
        category: NotificationCategory.COMPANY,
        title: 'New Company Onboarded',
        message: `We have a new partner company: ${payload.companyName}. Check out their profile for upcoming opportunities!`,
        metadata: { companyId: payload.companyId },
      });
    } catch (error) {
      this.logger.error('Failed to handle company.created event', error.stack);
    }
  }

  @OnEvent('placement-drive.published')
  async handlePlacementDrivePublished(payload: { driveId: string; title: string }) {
    try {
      await this.notificationsService.createSystemNotification({
        targetAudience: 'ALL_STUDENTS' as any,
        type: NotificationType.PLACEMENT_DRIVE,
        category: NotificationCategory.PLACEMENT,
        title: 'New Placement Drive',
        message: `A new placement drive "${payload.title}" has been published. Apply now if you meet the criteria!`,
        metadata: { driveId: payload.driveId },
      });
    } catch (error) {
      this.logger.error('Failed to handle placement-drive.published event', error.stack);
    }
  }

  @OnEvent('job.created')
  async handleJobCreated(payload: { jobId: string; title: string; companyName: string }) {
    try {
      await this.notificationsService.createSystemNotification({
        targetAudience: 'ALL_STUDENTS' as any,
        type: NotificationType.NEW_JOB,
        category: NotificationCategory.PLACEMENT,
        title: 'New Job Posted',
        message: `${payload.companyName} is hiring for ${payload.title}. Check the job board and apply now!`,
        metadata: { jobId: payload.jobId },
      });
    } catch (error) {
      this.logger.error('Failed to handle job.created event', error.stack);
    }
  }

  @OnEvent('announcement.published')
  async handleAnnouncementPublished(payload: { announcementId: string; title: string; message: string }) {
    try {
      await this.notificationsService.createSystemNotification({
        targetAudience: 'ALL_STUDENTS' as any,
        type: NotificationType.ANNOUNCEMENT,
        category: NotificationCategory.SYSTEM,
        title: payload.title,
        message: payload.message,
        metadata: { announcementId: payload.announcementId },
      });
    } catch (error) {
      this.logger.error('Failed to handle announcement.published event', error.stack);
    }
  }
}
