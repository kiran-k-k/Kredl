import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { LessonNotesService } from '../lesson-notes/lesson-notes.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import {
  CourseModule,
  CourseModuleDocument,
} from '../modules/schemas/module.schema';
import { ProgressService } from '../progress/progress.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonsFilterDto } from './dto/lessons-filter.dto';
import { SlugService } from '../../common/services/slug.service';
import { assertYoutubeUrl } from '../../common/utils/url-validators';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    @InjectModel(CourseModule.name)
    private readonly courseModuleModel: Model<CourseModuleDocument>,
    private readonly progressService: ProgressService,
    private readonly slugService: SlugService,
    private readonly lessonNotesService: LessonNotesService,
  ) {}

  async create(
    createLessonDto: CreateLessonDto,
    userId: string,
    session?: ClientSession,
  ): Promise<Lesson> {
    // Validate YouTube URL format
    assertYoutubeUrl(createLessonDto.youtubeUrl);

    const moduleObjectId = new Types.ObjectId(createLessonDto.moduleId);

    // Pre-flight: prevent duplicate order within a module
    const orderConflict = await this.lessonModel
      .findOne({
        moduleId: moduleObjectId,
        order: createLessonDto.order,
        isDeleted: { $ne: true },
      })
      .exec();
    if (orderConflict) {
      throw new BadRequestException(
        `A lesson with order ${createLessonDto.order} already exists in this module.`,
      );
    }

    // Auto-generate unique slug from title
    const slug = await this.slugService.generateUnique(
      createLessonDto.title,
      async (candidate) =>
        !!(await this.lessonModel.exists({
          moduleId: moduleObjectId,
          slug: candidate,
        })),
    );

    const lesson = new this.lessonModel({
      ...createLessonDto,
      moduleId: moduleObjectId,
      slug,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    return lesson.save({ session });
  }

  async findAll(
    query: LessonsFilterDto,
  ): Promise<{ data: Lesson[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { isDeleted: { $ne: true } };

    if (query.moduleId) {
      filter.moduleId = new Types.ObjectId(query.moduleId);
    }

    // Support courseId filtering by querying modules first
    if (query.courseId) {
      const modules = await this.courseModuleModel
        .find({
          courseId: new Types.ObjectId(query.courseId),
          isDeleted: { $ne: true },
        })
        .exec();
      const moduleIds = modules.map((m) => m._id);
      filter.moduleId = { $in: moduleIds };
    }

    const [data, total] = await Promise.all([
      this.lessonModel
        .find(filter)
        .populate('moduleId', 'title courseId')
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.lessonModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonModel
      .findOne({ _id: new Types.ObjectId(id), isDeleted: { $ne: true } })
      .exec();
    if (!lesson) {
      throw new NotFoundException(`Lesson #${id} not found`);
    }
    return lesson;
  }

  async update(
    id: string,
    updateLessonDto: UpdateLessonDto,
    userId: string,
  ): Promise<Lesson> {
    if (updateLessonDto.youtubeUrl) {
      assertYoutubeUrl(updateLessonDto.youtubeUrl);
    }

    const updateData: any = { ...updateLessonDto };
    if (updateData.moduleId) {
      updateData.moduleId = new Types.ObjectId(updateData.moduleId);
    }

    const lesson = await this.lessonModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), isDeleted: { $ne: true } },
        {
          ...updateData,
          updatedBy: new Types.ObjectId(userId),
        },
        { new: true },
      )
      .exec();

    if (!lesson) {
      throw new NotFoundException(`Lesson #${id} not found`);
    }
    return lesson;
  }

  async remove(id: string, userId: string): Promise<void> {
    const lesson = await this.lessonModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), isDeleted: { $ne: true } },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: new Types.ObjectId(userId),
        },
        { new: true },
      )
      .exec();

    if (!lesson) {
      throw new NotFoundException(`Lesson #${id} not found`);
    }
  }

  async completeLesson(lessonId: string, userId: string): Promise<void> {
    const lesson = await this.lessonModel
      .findOne({ _id: new Types.ObjectId(lessonId), isDeleted: { $ne: true } })
      .exec();
    if (!lesson) {
      throw new NotFoundException(`Lesson #${lessonId} not found`);
    }

    const moduleObj = await this.courseModuleModel
      .findOne({ _id: lesson.moduleId, isDeleted: { $ne: true } })
      .exec();
    if (!moduleObj) {
      throw new NotFoundException(
        `Module #${lesson.moduleId.toString()} not found`,
      );
    }

    // ── Guard 1: Enrollment ──────────────────────────────────────────────────
    const isEnrolled = await this.progressService.checkEnrollment(
      new Types.ObjectId(userId),
      moduleObj.courseId,
    );
    if (!isEnrolled) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    // ── Guard 2: Sequential lock enforcement ─────────────────────────────────
    // Fetch all modules and lessons to derive access state the same way the
    // GET handler does — prevents API-level bypass of the lock system.
    const modules = await this.courseModuleModel
      .find({ courseId: moduleObj.courseId, isDeleted: { $ne: true } })
      .sort({ order: 1 })
      .exec();
    const moduleIds = modules.map((m) => m._id);

    const allLessons = await this.lessonModel
      .find({
        moduleId: { $in: moduleIds },
        isDeleted: { $ne: true },
      })
      .sort({ order: 1 })
      .exec();

    const accessInfo = await this.progressService.calculateModuleAccess(
      new Types.ObjectId(userId),
      moduleObj.courseId,
      modules,
      allLessons,
    );
    const modAccess = accessInfo.modulesAccess.find(
      (a: any) => a.moduleId === moduleObj._id.toString(),
    );
    const isModuleLocked = modAccess ? modAccess.locked : true;

    const moduleLessons = allLessons.filter(
      (l) => l.moduleId.toString() === moduleObj._id.toString(),
    );
    const lessonsAccess = await this.progressService.calculateLessonsAccess(
      new Types.ObjectId(userId),
      moduleObj.courseId,
      moduleLessons,
      isModuleLocked,
    );
    const lessonAccess = lessonsAccess.find(
      (a) => a.lessonId === lesson._id.toString(),
    );
    if (!lessonAccess || lessonAccess.locked) {
      throw new ForbiddenException('Lesson is locked');
    }

    // ── Record completion ─────────────────────────────────────────────────────
    await this.progressService.markLessonComplete(
      new Types.ObjectId(userId),
      moduleObj.courseId,
      lesson._id,
    );

    // Recalculate percentage using all lessons already fetched
    const totalLessons = allLessons.length;
    await this.progressService.recalculatePercentage(
      new Types.ObjectId(userId),
      moduleObj.courseId,
      totalLessons,
    );
  }

  async getLessonDetailsForStudent(
    course: any,
    moduleSlug: string,
    lessonSlug: string,
    userId: string,
  ): Promise<any> {
    const userObjId = new Types.ObjectId(userId);

    // 1. Find the module under this course
    const targetModule = await this.courseModuleModel
      .findOne({
        courseId: course._id,
        slug: moduleSlug,
        status: 'published',
        isDeleted: { $ne: true },
      } as any)
      .exec();

    if (!targetModule) {
      throw new NotFoundException('Module not found');
    }

    // 2. Find the lesson under this module
    const targetLesson = await this.lessonModel
      .findOne({
        moduleId: targetModule._id,
        slug: lessonSlug,
        status: 'published',
        isDeleted: { $ne: true },
      } as any)
      .exec();

    if (!targetLesson) {
      throw new NotFoundException('Lesson not found');
    }

    // 3. Fetch sister modules of the course to compute module access/lock status
    const modules = await this.courseModuleModel
      .find({
        courseId: course._id,
        status: 'published',
        isDeleted: { $ne: true },
      } as any)
      .exec();

    // 4. Fetch all lessons of the course for lock calculations
    const moduleIds = modules.map((m) => m._id);
    const allLessons = await this.lessonModel
      .find({
        moduleId: { $in: moduleIds },
        isDeleted: { $ne: true },
        status: 'published',
      } as any)
      .exec();

    const accessInfo = await this.progressService.calculateModuleAccess(
      userObjId,
      course._id,
      modules,
      allLessons,
    );

    // 5. Check if the active module is locked
    const moduleAccess = accessInfo.modulesAccess.find(
      (a: any) => a.moduleId === targetModule._id.toString(),
    );
    const isModuleLocked = moduleAccess ? moduleAccess.locked : true;

    // 6. Fetch sister lessons of the target module sorted by order ASC
    const publishedLessons = allLessons
      .filter((l) => l.moduleId.toString() === targetModule._id.toString())
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // 7. Calculate sequential lessons access
    const lessonsAccess = await this.progressService.calculateLessonsAccess(
      userObjId,
      course._id,
      publishedLessons,
      isModuleLocked,
    );

    const activeLessonAccess = lessonsAccess.find(
      (a) => a.lessonId === targetLesson._id.toString(),
    );
    const isLessonLocked = activeLessonAccess
      ? activeLessonAccess.locked
      : true;

    if (isLessonLocked) {
      throw new ForbiddenException('Lesson is locked');
    }

    // 8. Track student access (Continue Learning / Last viewed)
    await this.progressService.trackViewedLesson(
      userObjId,
      course._id,
      targetModule._id,
      targetLesson._id,
    );

    // 9. Fetch lesson note
    const note = await this.lessonNotesService.findByLessonId(
      targetLesson._id.toString(),
    );

    // 10. Compute navigation: prev and next lessons (with title and slug)
    const activeIndex = publishedLessons.findIndex(
      (l) => l._id.toString() === targetLesson._id.toString(),
    );
    const prevLesson =
      activeIndex > 0 ? publishedLessons[activeIndex - 1] : null;
    const nextLesson =
      activeIndex < publishedLessons.length - 1
        ? publishedLessons[activeIndex + 1]
        : null;
    const isLastLesson = activeIndex === publishedLessons.length - 1;

    const progressDoc = await this.progressService.getProgress(
      userObjId,
      course._id,
    );
    
    const completedLessonIds = progressDoc?.completedLessons || [];
    const computedCourseProgress = allLessons.length > 0 
      ? Math.round((completedLessonIds.length / allLessons.length) * 100)
      : 0;
    const courseProgress = Math.max(
      Math.round(progressDoc?.percentage || 0),
      computedCourseProgress
    );
    const moduleProgress = moduleAccess ? moduleAccess.progress : 0;

    // Map sister lessons
    const sisterLessons = publishedLessons.map((les) => {
      const access = lessonsAccess.find(
        (a) => a.lessonId === les._id.toString(),
      );
      return {
        id: les._id.toString(),
        title: les.title,
        slug: les.slug,
        duration: les.durationMinutes || 0,
        order: les.order,
        completed: !!access?.completed,
        locked: access ? access.locked : true,
        current: les._id.toString() === targetLesson._id.toString(),
      };
    });

    return {
      course: {
        id: course._id.toString(),
        title: course.title,
        slug: course.slug,
      },
      module: {
        id: targetModule._id.toString(),
        title: targetModule.title,
        slug: targetModule.slug,
        description: targetModule.description || '',
      },
      lesson: {
        id: targetLesson._id.toString(),
        title: targetLesson.title,
        slug: targetLesson.slug,
        description: targetLesson.description || '',
        youtubeUrl: targetLesson.youtubeUrl || '',
        durationMinutes: targetLesson.durationMinutes || 0,
        order: targetLesson.order,
        learningObjectives: targetLesson.learningObjectives || [],
        keyPoints: targetLesson.keyPoints || [],
        notes: note ? note.content : '',
        completed: !!activeLessonAccess?.completed,
        completedAt:
          activeLessonAccess?.completed && progressDoc
            ? (progressDoc as any).updatedAt
            : undefined,
        locked: false,
      },
      sisterLessons,
      navigation: {
        previous: prevLesson
          ? { title: prevLesson.title, slug: prevLesson.slug }
          : null,
        next: nextLesson
          ? { title: nextLesson.title, slug: nextLesson.slug }
          : null,
        isLastLesson,
      },
      progress: {
        lessonCompleted: !!activeLessonAccess?.completed,
        moduleProgress,
        courseProgress,
      },
    };
  }
}
