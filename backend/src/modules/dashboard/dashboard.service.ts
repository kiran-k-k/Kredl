/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Progress,
  ProgressDocument,
  ProgressStatus,
} from '../progress/schemas/progress.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import {
  CourseModule,
  CourseModuleDocument,
} from '../modules/schemas/module.schema';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import {
  ModuleCompletion,
  ModuleCompletionDocument,
  ModuleStatus,
} from '../progress/schemas/module-completion.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import { ContinueLearningDto, LessonType } from './dto/continue-learning.dto';
import { ProgressSummaryDto } from './dto/progress-summary-response.dto';
import {
  ACTIVITY_PROVIDERS,
  IActivityProvider,
} from './interfaces/activity-provider.interface';
import {
  ActivityQueryDto,
  ActivityResponseDto,
  RecentActivityDto,
} from './dto/recent-activity.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(CourseModule.name)
    private moduleModel: Model<CourseModuleDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(ModuleCompletion.name)
    private moduleCompletionModel: Model<ModuleCompletionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @Inject(ACTIVITY_PROVIDERS) private activityProviders: IActivityProvider[],
  ) {}

  async getContinueLearning(
    userId: string,
  ): Promise<ContinueLearningDto | null> {
    const userObjId = new Types.ObjectId(userId);

    // 1. Find the most recently accessed active progress
    const progress = await this.progressModel
      .findOne({ userId: userObjId, status: ProgressStatus.IN_PROGRESS })
      .sort({ lastAccessedAt: -1 })
      .select(
        'courseId completedLessons lastAccessedModuleId percentage lastAccessedAt updatedAt',
      )
      .lean();

    if (!progress) {
      return null;
    }

    // 2. Fetch the Course
    const course = await this.courseModel
      .findOne({
        _id: progress.courseId,
        isDeleted: false,
        isActive: { $ne: false },
      } as any)
      .select('title slug thumbnail')
      .lean();

    if (!course) {
      this.logger.warn(
        `Course ${progress.courseId.toString()} not found or deleted for Progress ${progress._id.toString()}`,
      );
      return null;
    }

    // 3. Fetch all modules for this course, sorted by order
    const modules = await this.moduleModel
      .find({ courseId: course._id, isDeleted: false, isActive: { $ne: false } } as any)
      .sort({ order: 1 })
      .select('_id title slug order')
      .lean();

    if (modules.length === 0) {
      return null;
    }

    const moduleIds = modules.map((m) => m._id);
    const completedLessonStringIds = new Set(
      progress.completedLessons.map((id) => id.toString()),
    );

    // 4. Fetch all active lessons for these modules, sorted by order
    const lessons = await this.lessonModel
      .find({
        moduleId: { $in: moduleIds },
        isDeleted: false,
        isActive: { $ne: false },
      } as any)
      .sort({ order: 1 })
      .select('_id title slug moduleId order type')
      .lean();

    // 5. Determine the current module and lesson
    let currentModule: any = null;
    let nextLesson = null;

    for (const mod of modules) {
      const modLessons = lessons.filter(
        (l) => l.moduleId.toString() === mod._id.toString(),
      );
      const firstIncompleteLesson = modLessons.find(
        (l) => !completedLessonStringIds.has(l._id.toString()),
      );

      if (firstIncompleteLesson) {
        currentModule = mod;
        nextLesson = firstIncompleteLesson;
        break;
      }

      // If all lessons in this module are complete, but it's the last module
      if (
        !currentModule &&
        mod._id.toString() === modules[modules.length - 1]._id.toString()
      ) {
        currentModule = mod;
        nextLesson = modLessons[modLessons.length - 1] || null;
      }
    }

    // Fallback if somehow no incomplete lesson is found
    if (!currentModule) {
      currentModule = modules[0];
      nextLesson =
        lessons.find(
          (l) => l.moduleId.toString() === currentModule._id.toString(),
        ) || null;
    }

    return {
      courseId: course._id.toString(),
      courseTitle: course.title,
      courseSlug: course.slug,
      courseThumbnail: (course as any).thumbnail || '',
      moduleId: currentModule._id.toString(),
      moduleTitle: currentModule.title,
      moduleSlug: currentModule.slug,
      completionPercentage: Math.round(progress.percentage || 0),
      lastWatchedAt: progress.lastAccessedAt,
      lastActivityAt: (progress as any).updatedAt,
      nextLesson: nextLesson
        ? {
            lessonId: nextLesson._id.toString(),
            title: nextLesson.title,

            order: nextLesson.order,
            slug: (nextLesson as any).slug || '',
          }
        : undefined,
    };
  }

  async getProgressSummary(userId: string): Promise<ProgressSummaryDto> {
    const userObjId = new Types.ObjectId(userId);

    // 1. Fetch progress records joined with valid active courses
    const progressStats = await this.progressModel.aggregate([
      { $match: { userId: userObjId } },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      { $match: { 'course.isActive': { $ne: false }, 'course.isDeleted': false } },
      {
        $group: {
          _id: null,
          coursesEnrolled: { $sum: 1 },
          coursesCompleted: {
            $sum: {
              $cond: [{ $eq: ['$status', ProgressStatus.COMPLETED] }, 1, 0],
            },
          },
          totalPercentage: { $sum: '$percentage' },
          allCompletedLessonIds: { $push: '$completedLessons' },
        },
      },
    ]);

    const stats = progressStats[0] || {
      coursesEnrolled: 0,
      coursesCompleted: 0,
      totalPercentage: 0,
      allCompletedLessonIds: [],
    };

    // 2. Fetch completed modules count
    const modulesCompleted = await this.moduleCompletionModel
      .countDocuments({
        userId: userObjId,
        status: ModuleStatus.COMPLETED,
      })
      .exec();

    // 3. Compute overall progress
    const overallProgress =
      stats.coursesEnrolled > 0
        ? Math.round(stats.totalPercentage / stats.coursesEnrolled)
        : 0;

    // 4. Calculate lessons completed and hours learned, filtering deleted lessons
    let hoursLearned = 0;
    let lessonsCompleted = 0;

    // Flatten and deduplicate lesson IDs
    const flattenedIds = stats.allCompletedLessonIds.flat() as Types.ObjectId[];
    const uniqueLessonIdsString = new Set(
      flattenedIds.map((id) => id.toString()),
    );

    if (uniqueLessonIdsString.size > 0) {
      const lessonIds = Array.from(uniqueLessonIdsString).map(
        (id) => new Types.ObjectId(id),
      );
      const validLessons = await this.lessonModel
        .find({
          _id: { $in: lessonIds },
          isDeleted: { $ne: true },
        } as any)
        .select('durationMinutes')
        .lean()
        .exec();

      lessonsCompleted = validLessons.length;
      const totalMinutes = validLessons.reduce(
        (acc, curr) => acc + (curr.durationMinutes || 0),
        0,
      );
      hoursLearned = Math.round((totalMinutes / 60) * 10) / 10;
    }

    // 5. Fetch User Learning Streak
    const userDoc = await this.userModel.findById(userObjId).select('learningStreak').lean().exec();
    const learningStreak = userDoc?.learningStreak || 0;

    // 6. Calculate Active Project and Estimated Completion
    let activeProject = "N/A";
    let estimatedCompletion = "N/A";
    
    // Find latest active course progress
    const activeProgress = await this.progressModel
      .findOne({ userId: userObjId, status: ProgressStatus.IN_PROGRESS })
      .sort({ lastAccessedAt: -1 })
      .lean();

    if (activeProgress) {
      // Get all projects for this course
      const courseProjects = await this.projectModel.find({ courseId: activeProgress.courseId }).select('_id title estimatedDurationMinutes').lean().exec();
      
      // Find the first uncompleted project
      const completedProjectIdsStr = new Set((activeProgress.completedProjects || []).map(id => id.toString()));
      const uncompletedProject = courseProjects.find(p => !completedProjectIdsStr.has(p._id.toString()));
      if (uncompletedProject) {
        activeProject = uncompletedProject.title;
      }

      // Calculate estimated completion
      // Find all lessons for the course
      const courseLessons = await this.lessonModel.find({ courseId: activeProgress.courseId, isDeleted: { $ne: true } }).select('_id durationMinutes').lean().exec();
      const completedLessonIdsStr = new Set((activeProgress.completedLessons || []).map(id => id.toString()));
      
      let remainingMinutes = 0;
      courseLessons.forEach(l => {
        if (!completedLessonIdsStr.has(l._id.toString())) {
          remainingMinutes += (l.durationMinutes || 0);
        }
      });
      courseProjects.forEach(p => {
        if (!completedProjectIdsStr.has(p._id.toString())) {
          remainingMinutes += (p.estimatedDurationMinutes || 0);
        }
      });

      if (remainingMinutes > 0) {
        const hours = Math.floor(remainingMinutes / 60);
        const mins = remainingMinutes % 60;
        estimatedCompletion = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;
      } else if (activeProgress.percentage === 100) {
        estimatedCompletion = "Completed";
      }
    }

    return {
      coursesEnrolled: stats.coursesEnrolled,
      coursesCompleted: stats.coursesCompleted,
      modulesCompleted,
      lessonsCompleted,
      overallProgress,
      learningStreak,
      hoursLearned,
      activeProject,
      estimatedCompletion
    };
  }

  async getRecentActivity(
    userId: string,
    query: ActivityQueryDto,
  ): Promise<ActivityResponseDto> {
    const start = Date.now();

    // Fetch activities from all registered providers in parallel
    const activityPromises = this.activityProviders.map((provider) =>
      provider.getActivities(userId, query),
    );
    const nestedActivities = await Promise.all(activityPromises);

    // Merge all activities
    const allActivities: RecentActivityDto[] = nestedActivities.flat();

    // Sort combined results
    const sortDir = query.sortDirection === 'asc' ? 1 : -1;
    allActivities.sort((a, b) => {
      return (a.timestamp.getTime() - b.timestamp.getTime()) * sortDir;
    });

    const limit = query.limit || 20;
    const hasMore = allActivities.length > limit;

    // Slice to limit
    const finalActivities = allActivities.slice(0, limit);

    let nextCursor = null;
    if (hasMore) {
      nextCursor =
        finalActivities[finalActivities.length - 1].timestamp.toISOString();
    }

    const durationMs = Date.now() - start;
    this.logger.debug(
      `[getRecentActivity] Fetched activities in ${durationMs}ms`,
    );

    return {
      activities: finalActivities,
      total: finalActivities.length,
      hasMore,
      nextCursor,
      generatedAt: new Date(),
    };
  }
}
