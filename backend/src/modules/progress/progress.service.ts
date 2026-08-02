import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ContinueLearningDto,
  LessonType,
} from '../dashboard/dto/continue-learning.dto';
import { ProgressSummaryDto } from '../dashboard/dto/progress-summary-response.dto';
import { ModuleStatus } from './schemas/module-completion.schema';
import { Progress, ProgressDocument } from './schemas/progress.schema';
import {
  ModuleCompletion,
  ModuleCompletionDocument,
} from './schemas/module-completion.schema';
import { Quiz, QuizDocument } from '../quiz/schemas/quiz.schema';
import {
  QuizAttempt,
  QuizAttemptDocument,
  QuizAttemptStatus,
} from '../quiz/schemas/quiz-attempt.schema';

import { Course, CourseDocument } from '../courses/schemas/course.schema';
import {
  CourseModule,
  CourseModuleDocument,
} from '../modules/schemas/module.schema';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ProgressStatus } from './schemas/progress.schema';

import { ProgressCalculationService } from './progress-calculation.service';

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(
    private readonly progressCalculationService: ProgressCalculationService,
    @InjectModel(Progress.name)
    private progressModel: Model<ProgressDocument>,
    @InjectModel(ModuleCompletion.name)
    private moduleCompletionModel: Model<ModuleCompletionDocument>,
    @InjectModel(Quiz.name)
    private quizModel: Model<QuizDocument>,
    @InjectModel(QuizAttempt.name)
    private quizAttemptModel: Model<QuizAttemptDocument>,
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
    @InjectModel(CourseModule.name)
    private moduleModel: Model<CourseModuleDocument>,
    @InjectModel(Lesson.name)
    private lessonModel: Model<LessonDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async enrollUser(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
  ): Promise<void> {
    await this.progressModel
      .updateOne(
        { userId, courseId },
        {
          $setOnInsert: {
            completedLessons: [],
            percentage: 0,
            isDirty: false,
            status: 'not_started',
          },
        },
        { upsert: true },
      )
      .exec();
  }

  async checkEnrollment(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
  ): Promise<boolean> {
    const exists = await this.progressModel.exists({ userId, courseId });
    return !!exists;
  }

  async getProgress(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
  ): Promise<Progress | null> {
    return this.progressModel.findOne({ userId, courseId }).lean().exec();
  }

  async markProgressDirty(userId: Types.ObjectId, courseId: Types.ObjectId) {
    await this.progressModel.updateOne(
      { userId, courseId },
      { $set: { isDirty: true } },
      { upsert: true },
    );
  }

  async markLessonComplete(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    lessonId: Types.ObjectId,
  ): Promise<void> {
    const lesson = await this.lessonModel.findById(lessonId).exec();
    if (!lesson) return;

    await this.progressModel.updateOne(
      { userId, courseId },
      { 
        $addToSet: { completedLessons: lessonId },
        $set: { isDirty: true }
      },
      { upsert: true },
    );
    
    await this.evaluateModuleCompletion(userId, courseId, lesson.moduleId);
    
    const totalLessons = await this.lessonModel.countDocuments({
      courseId,
      isDeleted: { $ne: true },
    });
    await this.progressCalculationService.recalculatePercentage(userId, courseId, totalLessons);
  }

  async markLessonIncomplete(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    lessonId: Types.ObjectId,
  ): Promise<void> {
    const lesson = await this.lessonModel.findById(lessonId).exec();
    if (!lesson) return;

    await this.progressModel.updateOne(
      { userId, courseId },
      { 
        $pull: { completedLessons: lessonId },
        $set: { isDirty: true }
      }
    );
    
    await this.evaluateModuleCompletion(userId, courseId, lesson.moduleId);
    
    const totalLessons = await this.lessonModel.countDocuments({
      courseId,
      isDeleted: { $ne: true },
    });
    await this.progressCalculationService.recalculatePercentage(userId, courseId, totalLessons);
  }

  async toggleProjectCompletion(
    userId: string,
    courseId: string,
    projectId: string,
  ): Promise<{ completed: boolean }> {
    const userObjId = new Types.ObjectId(userId);
    const courseObjId = new Types.ObjectId(courseId);
    const projectObjId = new Types.ObjectId(projectId);

    const progress = await this.progressModel.findOne({
      userId: userObjId,
      courseId: courseObjId,
    });
    if (!progress) {
      throw new Error('Progress record not found. User might not be enrolled.');
    }

    const isCompleted = progress.completedProjects.some((id) =>
      id.equals(projectObjId),
    );

    if (isCompleted) {
      await this.progressModel.updateOne(
        { userId: userObjId, courseId: courseObjId },
        { 
          $pull: { completedProjects: projectObjId },
          $set: { isDirty: true }
        },
      );
    } else {
      await this.progressModel.updateOne(
        { userId: userObjId, courseId: courseObjId },
        { 
          $addToSet: { completedProjects: projectObjId },
          $set: { isDirty: true }
        },
      );
    }

    const totalLessons = await this.lessonModel.countDocuments({
      courseId: courseObjId,
      isDeleted: { $ne: true },
    });
    await this.progressCalculationService.recalculatePercentage(userObjId, courseObjId, totalLessons);

    return { completed: !isCompleted };
  }

  async calculateLessonsAccess(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    lessons: any[],
    isModuleLocked: boolean,
  ): Promise<
    Array<{
      lessonId: string;
      completed: boolean;
      locked: boolean;
    }>
  > {
    const progressDoc = await this.progressModel
      .findOne({ userId, courseId })
      .exec();
    const completedLessonIds = progressDoc
      ? new Set(progressDoc.completedLessons.map((id) => id.toString()))
      : new Set<string>();

    const lessonsAccess = [];
    let previousLessonCompleted = true; // The first lesson is unlocked if the module is unlocked

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const lessonIdStr = lesson._id.toString();
      const completed = completedLessonIds.has(lessonIdStr);
      const locked = isModuleLocked || !previousLessonCompleted;

      lessonsAccess.push({
        lessonId: lessonIdStr,
        completed,
        locked,
      });

      previousLessonCompleted = completed;
    }

    return lessonsAccess;
  }

  async trackViewedLesson(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    moduleId: Types.ObjectId,
    lessonId: Types.ObjectId,
  ): Promise<void> {
    await this.progressModel.updateOne(
      { userId, courseId },
      {
        $set: {
          lastAccessedModuleId: moduleId,
          lastViewedLesson: lessonId,
          lastViewedAt: new Date(),
          lastAccessedAt: new Date(),
        },
      },
      { upsert: true },
    );

    // Update learning streak in the background
    this.updateLearningStreak(userId).catch(err => 
      this.logger.error(`Failed to update learning streak for user ${userId}`, err.stack)
    );
  }

  private async updateLearningStreak(userId: Types.ObjectId): Promise<void> {
    const user = await this.userModel.findById(userId).select('learningStreak lastLearnedAt').exec();
    if (!user) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (user.lastLearnedAt) {
      const lastLearnedDate = new Date(user.lastLearnedAt.getFullYear(), user.lastLearnedAt.getMonth(), user.lastLearnedAt.getDate());
      
      const diffTime = Math.abs(today.getTime() - lastLearnedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Learned yesterday, streak continues!
        user.learningStreak = (user.learningStreak || 0) + 1;
      } else if (diffDays > 1) {
        // Streak broken
        user.learningStreak = 1;
      }
      // If diffDays === 0, they already learned today, do nothing to streak.
    } else {
      // First time learning
      user.learningStreak = 1;
    }

    user.lastLearnedAt = now;
    await user.save();
  }

  private async evaluateModuleCompletion(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    moduleId: Types.ObjectId,
  ): Promise<void> {
    const lessons = await this.lessonModel.find({
      moduleId,
      status: 'published' as any,
      isDeleted: { $ne: true },
    }).lean().exec();

    const progress = await this.progressModel.findOne({ userId, courseId }).lean().exec();
    const completedLessonIds = new Set((progress?.completedLessons || []).map((id) => id.toString()));

    const allLessonsCompleted = lessons.length > 0 && lessons.every((l) => completedLessonIds.has(l._id.toString()));

    const quiz = await this.quizModel.findOne({ moduleId, isPublished: true }).lean().exec();

    if (allLessonsCompleted) {
      if (!quiz) {
        await this.moduleCompletionModel.updateOne(
          { userId, moduleId },
          {
            $set: {
              courseId,
              status: ModuleStatus.COMPLETED,
              completedAt: new Date(),
            },
          },
          { upsert: true }
        );
      } else {
        const completion = await this.moduleCompletionModel.findOne({ userId, moduleId }).lean().exec();
        if (!completion || completion.status !== ModuleStatus.COMPLETED) {
          await this.moduleCompletionModel.updateOne(
            { userId, moduleId },
            {
              $set: {
                courseId,
                status: ModuleStatus.UNLOCKED,
              },
            },
            { upsert: true }
          );
        }
      }
    } else {
      await this.moduleCompletionModel.updateOne(
        { userId, moduleId },
        {
          $set: {
            status: ModuleStatus.UNLOCKED,
          },
        }
      );
    }
  }

  async saveQuizScore(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    moduleId: Types.ObjectId,
    quizId: Types.ObjectId,
    scorePercentage: number,
    passed: boolean,
    answers: any[] = []
  ): Promise<void> {

    if (passed) {
      await this.moduleCompletionModel.updateOne(
        { userId, moduleId },
        {
          $set: {
            courseId,
            status: ModuleStatus.COMPLETED,
            quizScore: scorePercentage,
            completedAt: new Date(),
          },
        },
        { upsert: true },
      );
    }

    await this.progressModel.updateOne(
      { userId, courseId },
      { $set: { isDirty: true } },
      { upsert: true }
    );

    const totalLessons = await this.lessonModel.countDocuments({
      courseId,
      isDeleted: { $ne: true },
    });
    await this.progressCalculationService.recalculatePercentage(userId, courseId, totalLessons);
  }

  async getEnrolledCourses(userId: string): Promise<any[]> {
    const userObjId = new Types.ObjectId(userId);

    const progresses = await this.progressModel
      .find({ userId: userObjId })
      .sort({ lastAccessedAt: -1 })
      .lean()
      .exec();

    if (!progresses || progresses.length === 0) {
      return [];
    }

    const courseIds = progresses.map((p) => p.courseId);
    const courses = await this.courseModel
      .find({ _id: { $in: courseIds }, isDeleted: false })
      .lean()
      .exec();

    const courseMap = new Map(courses.map((c) => [c._id.toString(), c]));

    const result = [];
    for (const p of progresses) {
      const course = courseMap.get(p.courseId.toString());
      if (!course) continue;

      const totalLessons = (course as any).lessonCount || 0;
      const completedLessonsRaw = p.completedLessons?.length || 0;
      // Clamp completedLessons so it doesn't exceed totalLessons (prevents >100% progress and negative remaining)
      const completedLessons = totalLessons > 0 ? Math.min(completedLessonsRaw, totalLessons) : completedLessonsRaw;
      
      const computedProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      // Clamp final progress to 100% max
      const finalProgress = Math.min(100, Math.max(Math.round(p.percentage || 0), computedProgress));

      result.push({
        id: course._id.toString(),
        title: course.title,
        slug: course.slug,
        thumbnail: (course as any).thumbnail || '',
        progress: finalProgress,
        lastAccessedAt: p.lastAccessedAt,
        totalLessons,
        completedLessons,
        status: p.status || (finalProgress >= 100 ? 'completed' : 'in-progress'),
      });
    }

    return result;
  }

  async recalculatePercentage(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    totalLessons: number,
  ) {
    return this.progressCalculationService.recalculatePercentage(
      userId,
      courseId,
      totalLessons,
    );
  }

  async calculateModuleAccess(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    modules: any[],
    lessons: any[],
  ): Promise<any> {
    return this.progressCalculationService.calculateModuleAccess(
      userId,
      courseId,
      modules,
      lessons,
    );
  }

  async getCourseProgressDetails(
    courseId: string,
    userId: string,
  ): Promise<any> {
    const userObjId = new Types.ObjectId(userId);
    const courseObjId = new Types.ObjectId(courseId);

    const progress = await this.progressModel
      .findOne({
        userId: userObjId,
        courseId: courseObjId,
      })
      .exec();

    if (!progress) {
      return {
        courseProgress: 0,
        moduleProgress: 0,
        completedLessons: [],
        completedModules: [],
        courseCompleted: false,
        moduleCompleted: false,
      };
    }

    const completedLessonIds = progress.completedLessons.map((id) =>
      id.toString(),
    );
    const completedLessonSet = new Set(completedLessonIds);

    // Fetch modules of the course
    const modules = await this.moduleModel
      .find({
        courseId: courseObjId,
        status: 'published' as any,
        isDeleted: { $ne: true },
      } as any)
      .sort({ order: 1 })
      .exec();

    // Fetch all lessons of the course
    const moduleIds = modules.map((m) => m._id);
    const lessons = await this.lessonModel
      .find({
        moduleId: { $in: moduleIds },
        status: 'published' as any,
        isDeleted: { $ne: true },
      } as any)
      .sort({ order: 1 })
      .exec();

    // Group lessons by module to calculate completions
    const completedModulesList: string[] = [];
    let currentModule = null;
    let currentLesson = null;
    let moduleProgress = 0;
    let moduleCompleted = false;

    // Traverse modules in order
    for (const mod of modules) {
      const modLessons = lessons.filter(
        (l) => l.moduleId.toString() === mod._id.toString(),
      );
      const totalLessons = modLessons.length;
      const completedModLessons = modLessons.filter((l) =>
        completedLessonSet.has(l._id.toString()),
      );

      const isCompleted =
        totalLessons > 0 && completedModLessons.length === totalLessons;
      if (isCompleted) {
        completedModulesList.push(mod._id.toString());
      }

      // First module that is not completed or the last one is the current module
      if (
        !currentModule &&
        (!isCompleted ||
          mod._id.toString() === modules[modules.length - 1]._id.toString())
      ) {
        currentModule = mod;
        moduleProgress =
          totalLessons > 0
            ? Math.round((completedModLessons.length / totalLessons) * 100)
            : 0;
        moduleCompleted = isCompleted;

        // Find current lesson: first uncompleted lesson in this module, or the last one
        const uncompleted = modLessons.find(
          (l) => !completedLessonSet.has(l._id.toString()),
        );
        currentLesson =
          uncompleted || modLessons[modLessons.length - 1] || null;
      }
    }

    const validCompletedCourseLessons = Math.min(completedLessonIds.length, lessons.length);
    const computedCourseProgress = lessons.length > 0 ? Math.round((validCompletedCourseLessons / lessons.length) * 100) : 0;
    const finalCourseProgress = Math.min(100, Math.max(Math.round(progress.percentage || 0), computedCourseProgress));

    const courseCompleted =
      finalCourseProgress >= 100 ||
      (modules.length > 0 && completedModulesList.length === modules.length);

    return {
      courseProgress: finalCourseProgress,
      moduleProgress,
      completedLessons: completedLessonIds,
      completedModules: completedModulesList,
      currentLesson: currentLesson
        ? {
            id: currentLesson._id.toString(),
            title: currentLesson.title,
            slug: currentLesson.slug,
          }
        : null,
      currentModule: currentModule
        ? {
            id: currentModule._id.toString(),
            title: currentModule.title,
            slug: currentModule.slug,
          }
        : null,
      courseCompleted,
      moduleCompleted,
      completionDate: courseCompleted ? (progress as any).updatedAt : null,
    };
  }
}
