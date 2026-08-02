import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Progress, ProgressDocument } from './schemas/progress.schema';
import {
  ModuleCompletion,
  ModuleCompletionDocument,
  ModuleStatus,
} from './schemas/module-completion.schema';
import { Quiz, QuizDocument } from '../quiz/schemas/quiz.schema';
import { CourseModule, CourseModuleDocument } from '../modules/schemas/module.schema';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Course, CourseDocument } from '../courses/schemas/course.schema';

@Injectable()
export class ProgressCalculationService {
  private readonly logger = new Logger(ProgressCalculationService.name);

  constructor(
    @InjectModel(Progress.name)
    private progressModel: Model<ProgressDocument>,
    @InjectModel(ModuleCompletion.name)
    private moduleCompletionModel: Model<ModuleCompletionDocument>,
    @InjectModel(Quiz.name)
    private quizModel: Model<QuizDocument>,
    @InjectModel(CourseModule.name)
    private moduleModel: Model<CourseModuleDocument>,
    @InjectModel(Lesson.name)
    private lessonModel: Model<LessonDocument>,
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async recalculatePercentage(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    totalLessons: number,
  ) {
    const progress = await this.progressModel.findOne({ userId, courseId });
    if (!progress) return;
    if (!progress.isDirty) return; // Optimization: only recalculate if dirty

    const completed = progress.completedLessons.length;
    const percentage = totalLessons > 0 ? (completed / totalLessons) * 100 : 0;

    progress.percentage = percentage;
    progress.isDirty = false;
    progress.lastCalculatedAt = new Date();

    if (percentage >= 100) {
      if (progress.status !== ('completed' as any)) {
        progress.status = 'completed' as any;
        
        // Fetch course title for the notification
        const course = await this.courseModel.findById(courseId).exec();
        
        this.eventEmitter.emit('course.completed', {
          userId: userId.toString(),
          courseId: courseId.toString(),
          courseTitle: course?.title,
        });
      }
    } else if (percentage > 0) {
      progress.status = 'in_progress' as any;
    }

    await progress.save();
    this.logger.log(
      `Recalculated progress for user ${userId} on course ${courseId}: ${percentage}%`,
    );
  }

  async calculateModuleAccess(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    modules: any[],
    lessons: any[],
  ): Promise<{
    completedModules: number;
    totalModules: number;
    modulesAccess: Array<{
      moduleId: string;
      completedLessons: string[];
      totalLessons: number;
      progress: number;
      locked: boolean;
      available: boolean;
      lessonsCompleted: boolean;
      quizAvailable: boolean;
      quizPassed: boolean;
      quizFailed: boolean;
      nextModuleUnlocked: boolean;
      completed: boolean;
      nextLessonId?: string;
    }>;
  }> {
    const progressDoc = await this.progressModel
      .findOne({ userId, courseId })
      .exec();
    const completedLessonIds = progressDoc
      ? new Set(progressDoc.completedLessons.map((id) => id.toString()))
      : new Set<string>();

    const completions = await this.moduleCompletionModel
      .find({ userId, courseId })
      .exec();
    const completionMap = new Map(
      completions.map((c) => [c.moduleId.toString(), c]),
    );

    const quizzes = await this.quizModel
      .find({
        moduleId: { $in: modules.map((m) => m._id) },
        isPublished: true,
      })
      .exec();
    const quizMap = new Set(quizzes.map((q) => q.moduleId.toString()));

    const modulesAccess = [];
    let completedModules = 0;
    let previousModuleCompleted = true; // First module is always unlocked

    for (let i = 0; i < modules.length; i++) {
      const mod = modules[i];
      const modLessons = lessons.filter((l) => {
        const lModId = l.moduleId._id ? l.moduleId._id.toString() : l.moduleId.toString();
        return lModId === mod._id.toString();
      });
      const totalLessons = modLessons.length;

      const completedModLessons = modLessons.filter((l) =>
        completedLessonIds.has(l._id.toString()),
      );
      const completedLessonsList = completedModLessons.map((l) =>
        l._id.toString(),
      );

      const hasQuiz = quizMap.has(mod._id.toString());
      const completionRecord = completionMap.get(mod._id.toString());
      const progress =
        totalLessons > 0
          ? Math.round((completedModLessons.length / totalLessons) * 100)
          : 0;

      const completed =
        totalLessons > 0 &&
        completedModLessons.length === totalLessons &&
        (!hasQuiz || (completionRecord?.status === ModuleStatus.COMPLETED && completionRecord?.quizScore !== undefined));
      
      const locked = !previousModuleCompleted;

      // Find first incomplete lesson in this module
      const firstIncompleteLesson = modLessons.find(
        (l) => !completedLessonIds.has(l._id.toString()),
      );

      modulesAccess.push({
        moduleId: mod._id.toString(),
        completedLessons: completedLessonsList,
        totalLessons,
        progress,
        locked,
        available: !locked,
        lessonsCompleted:
          totalLessons > 0 && completedModLessons.length === totalLessons,
        quizAvailable:
          hasQuiz &&
          totalLessons > 0 &&
          completedModLessons.length === totalLessons,
        quizPassed: hasQuiz && completionRecord?.status === ModuleStatus.COMPLETED && completionRecord?.quizScore !== undefined,
        quizFailed: false, // Update if failure logic exists
        nextModuleUnlocked: completed,
        completed,
        nextLessonId: firstIncompleteLesson
          ? firstIncompleteLesson._id.toString()
          : undefined,
      });

      if (completed) completedModules++;

      // Current module must be completed to unlock the next one
      previousModuleCompleted = completed;
    }

    return {
      completedModules,
      totalModules: modules.length,
      modulesAccess,
    };
  }
}
