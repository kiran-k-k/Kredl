/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import { ActivityType } from '../../../common/enums/activity-type.enum';
import { RecentActivityDto } from '../dto/recent-activity.dto';

export class ActivityMapper {
  static mapProgressToActivity(record: Record<string, any>): RecentActivityDto {
    const isCompleted = record.status === 'completed';
    return {
      activityId: record._id.toString(),
      activityType: isCompleted
        ? ActivityType.COURSE_COMPLETED
        : ActivityType.RESUME_LEARNING,
      title: isCompleted ? 'Course Completed' : 'Resumed Course',
      description: record.course?.title || 'Course',
      timestamp: isCompleted
        ? record.updatedAt || record.lastAccessedAt
        : record.lastAccessedAt,
      courseId: record.courseId.toString(),
      courseTitle: record.course?.title,
      moduleId: record.lastAccessedModuleId?.toString(),
      metadata: {
        completionPercentage: record.percentage,
      },
    };
  }

  static mapBookmarkToActivity(record: Record<string, any>): RecentActivityDto {
    return {
      activityId: record._id.toString(),
      activityType: ActivityType.COURSE_BOOKMARKED,
      title: 'Course Bookmarked',
      description: record.course?.title || 'Course',
      timestamp: record.createdAt,
      courseId: record.entityId.toString(),
      courseTitle: record.course?.title,
    };
  }

  static mapQuizAttemptToActivity(
    record: Record<string, any>,
  ): RecentActivityDto {
    return {
      activityId: record._id.toString(),
      activityType: record.passed
        ? ActivityType.QUIZ_PASSED
        : ActivityType.QUIZ_FAILED,
      title: record.passed ? 'Quiz Passed' : 'Quiz Failed',
      description: record.module?.title || 'Module Quiz',
      timestamp: record.submittedAt,
      courseId: record.module?.courseId?.toString(), // Assuming module aggregates courseId
      courseTitle: record.course?.title,
      moduleId: record.moduleId.toString(),
      metadata: {
        score: record.score,
        percentage: record.percentage,
        attemptNumber: record.attemptNumber,
        duration: record.timeTakenSeconds,
      },
    };
  }

  static mapModuleCompletionToActivity(
    record: Record<string, any>,
  ): RecentActivityDto {
    return {
      activityId: record._id.toString(),
      activityType: ActivityType.MODULE_COMPLETED,
      title: 'Module Completed',
      description: record.module?.title || 'Module',
      timestamp: record.completedAt || record.updatedAt,
      courseId: record.courseId.toString(),
      courseTitle: record.course?.title,
      moduleId: record.moduleId.toString(),
      metadata: {
        score: record.quizScore,
      },
    };
  }
}
