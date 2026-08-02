import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { Course, CourseDocument, CourseStatus } from './schemas/course.schema';
import {
  Progress,
  ProgressDocument,
} from '../progress/schemas/progress.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SlugService } from '../../common/services/slug.service';
import { CourseModulesService } from '../modules/modules.service';
import { LessonsService } from '../lessons/lessons.service';
import { ProgressService } from '../progress/progress.service';
import { CourseModulesListResponseDto } from './dto/course-modules-response.dto';
import { ModuleLessonsResponseDto } from './dto/module-lessons-response.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    private readonly slugService: SlugService,
    private readonly courseModulesService: CourseModulesService,
    private readonly lessonsService: LessonsService,
    private readonly progressService: ProgressService,
  ) {}

  async create(
    createCourseDto: CreateCourseDto,
    userId: string,
    session?: ClientSession,
  ): Promise<Course> {
    const baseSlug = this.slugService.generate(
      createCourseDto.slug ?? createCourseDto.title,
    );
    let candidate = baseSlug;
    let suffix = 2;

    while (await this.courseModel.exists({ slug: candidate })) {
      candidate = `${baseSlug}-${suffix}`;
      suffix++;
    }

    const course = new this.courseModel({
      ...createCourseDto,
      slug: candidate,
      difficultyLevel: createCourseDto.difficulty, // keep difficultyLevel in sync for backwards compatibility
      status: createCourseDto.isPublished
        ? CourseStatus.PUBLISHED
        : CourseStatus.DRAFT,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    return course.save({ session });
  }

  async enroll(courseId: string, userId: string): Promise<void> {
    const courseExists = await this.courseModel.exists({
      _id: new Types.ObjectId(courseId),
      isDeleted: { $ne: true },
      isPublished: true,
      status: CourseStatus.PUBLISHED,
    });
    if (!courseExists) {
      throw new NotFoundException(
        `Course #${courseId} not found or not available for enrollment`,
      );
    }

    await this.progressService.enrollUser(
      new Types.ObjectId(userId),
      new Types.ObjectId(courseId),
    );

    // Increment enrollment count
    await this.courseModel
      .updateOne(
        { _id: new Types.ObjectId(courseId) },
        { $inc: { enrollmentCount: 1 } },
      )
      .exec();
  }

  async checkEnrollment(courseId: string, userId?: string): Promise<boolean> {
    if (!userId) return false;
    return this.progressService.checkEnrollment(
      new Types.ObjectId(userId),
      new Types.ObjectId(courseId),
    );
  }

  async findAll(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      difficulty?: string;
      sort?: string;
      isFeatured?: string;
    },
    callerRole?: string,
    userId?: string,
  ) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Number(query.limit || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { isDeleted: { $ne: true } };

    // Student/Public filters: only published courses
    if (callerRole === 'student' || !callerRole) {
      filter.isPublished = true;
    }

    // Search query on title, description, category, difficulty
    if (query.search) {
      const searchRegex = { $regex: query.search, $options: 'i' };
      filter.$or = [
        { title: searchRegex },
        { shortDescription: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { difficulty: searchRegex },
      ];
    }

    // Category filter
    if (query.category) {
      filter.category = query.category;
    }

    // Difficulty filter
    if (query.difficulty) {
      filter.difficulty = query.difficulty;
    }

    // Featured filter
    if (query.isFeatured === 'true') {
      filter.isFeatured = true;
    }

    // Sorting strategy
    let sortObj: Record<string, any> = { displayOrder: 1, createdAt: -1 }; // Default
    if (query.sort === 'newest') {
      sortObj = { createdAt: -1 };
    } else if (query.sort === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (query.sort === 'alphabetical') {
      sortObj = { title: 1 };
    }

    const [data, total] = await Promise.all([
      this.courseModel
        .find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.courseModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Resolve enrollment dynamically if userId is supplied
    const resolvedData = await Promise.all(
      data.map(async (course) => {
        const isEnrolled = await this.checkEnrollment(
          course._id.toString(),
          userId,
        );
        const obj = course.toObject();
        return { ...obj, isEnrolled };
      }),
    );

    return {
      data: resolvedData,
      totalItems: total,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    };
  }

  async findOne(
    id: string,
    callerRole?: string,
    userId?: string,
  ): Promise<Course & { isEnrolled: boolean; completedLessons?: string[] }> {
    const filter: Record<string, any> = { _id: id, isDeleted: { $ne: true } };
    if (callerRole === 'student') {
      filter.isPublished = true;
    }

    const course = await this.courseModel.findOne(filter).exec();
    if (!course) {
      throw new NotFoundException(`Course #${id} not found`);
    }

    const progress = userId
      ? await this.progressService.getProgress(
          new Types.ObjectId(userId),
          course._id,
        )
      : null;

    const isEnrolled = !!progress;
    const completedLessons = progress
      ? progress.completedLessons.map((id) => id.toString())
      : [];
    const obj = course.toObject();
    return { ...obj, isEnrolled, completedLessons };
  }

  async findOneBySlug(
    slug: string,
    callerRole?: string,
    userId?: string,
  ): Promise<Course & { isEnrolled: boolean; completedLessons?: string[] }> {
    const filter: Record<string, any> = { slug, isDeleted: { $ne: true } };
    if (callerRole === 'student' || !callerRole) {
      filter.isPublished = true;
    }

    const course = await this.courseModel.findOne(filter).exec();
    if (!course) {
      throw new NotFoundException(`Course with slug "${slug}" not found`);
    }

    const progress = userId
      ? await this.progressService.getProgress(
          new Types.ObjectId(userId),
          course._id,
        )
      : null;

    const isEnrolled = !!progress;
    const completedLessons = progress
      ? progress.completedLessons.map((id) => id.toString())
      : [];
    const obj = course.toObject();
    return { ...obj, isEnrolled, completedLessons };
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    userId: string,
    session?: ClientSession,
  ): Promise<Course> {
    const updateData: Record<string, any> = {
      ...updateCourseDto,
      updatedBy: new Types.ObjectId(userId),
    };

    if (updateCourseDto.difficulty) {
      updateData.difficultyLevel = updateCourseDto.difficulty;
    }

    if (updateCourseDto.isPublished !== undefined) {
      updateData.status = updateCourseDto.isPublished
        ? CourseStatus.PUBLISHED
        : CourseStatus.DRAFT;
    }

    const course = await this.courseModel
      .findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, updateData, {
        new: true,
        session,
      })
      .exec();

    if (!course) {
      throw new NotFoundException(`Course #${id} not found`);
    }
    return course;
  }

  async remove(
    id: string,
    userId: string,
    session?: ClientSession,
  ): Promise<void> {
    const course = await this.courseModel
      .findOneAndUpdate(
        { _id: id, isDeleted: { $ne: true } },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: new Types.ObjectId(userId),
          status: CourseStatus.ARCHIVED,
          isPublished: false,
        },
        { new: true, session },
      )
      .exec();
    if (!course) {
      throw new NotFoundException(`Course #${id} not found`);
    }
  }

  async publish(
    id: string,
    userId: string,
    session?: ClientSession,
  ): Promise<Course> {
    const course = await this.courseModel
      .findOneAndUpdate(
        { _id: id, isDeleted: { $ne: true } },
        {
          isPublished: true,
          status: CourseStatus.PUBLISHED,
          updatedBy: new Types.ObjectId(userId),
        },
        { new: true, session },
      )
      .exec();
    if (!course) {
      throw new NotFoundException(`Course #${id} not found`);
    }
    return course;
  }

  async unpublish(
    id: string,
    userId: string,
    session?: ClientSession,
  ): Promise<Course> {
    const course = await this.courseModel
      .findOneAndUpdate(
        { _id: id, isDeleted: { $ne: true } },
        {
          isPublished: false,
          status: CourseStatus.DRAFT,
          updatedBy: new Types.ObjectId(userId),
        },
        { new: true, session },
      )
      .exec();
    if (!course) {
      throw new NotFoundException(`Course #${id} not found`);
    }
    return course;
  }

  async getAdminStats(): Promise<{
    total: number;
    published: number;
    draft: number;
  }> {
    const [total, published, draft] = await Promise.all([
      this.courseModel.countDocuments({ isDeleted: { $ne: true } }),
      this.courseModel.countDocuments({
        isPublished: true,
        isDeleted: { $ne: true },
      }),
      this.courseModel.countDocuments({
        isPublished: false,
        isDeleted: { $ne: true },
      }),
    ]);
    return { total, published, draft };
  }

  async getCourseModules(
    courseIdOrSlug: string,
    userId: string,
  ): Promise<CourseModulesListResponseDto> {
    const isObjectId = Types.ObjectId.isValid(courseIdOrSlug);
    const course = await this.courseModel
      .findOne({
        ...(isObjectId ? { _id: courseIdOrSlug } : { slug: courseIdOrSlug }),
        isDeleted: { $ne: true },
      })
      .exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const progressDoc = await this.progressService.getProgress(
      new Types.ObjectId(userId),
      course._id,
    );

    if (!progressDoc) {
      throw new BadRequestException('Student is not enrolled in this course');
    }

    // Fetch modules through CourseModulesService
    const { data: rawModules } = await this.courseModulesService.findAll({
      courseId: course._id.toString(),
      limit: 100,
    });
    const publishedModules = rawModules.filter(
      (m) => m.status === 'published' && !m.isDeleted,
    );

    // Fetch lessons through LessonsService
    const { data: rawLessons } = await this.lessonsService.findAll({
      courseId: course._id.toString(),
      limit: 100,
    });

    const accessInfo = await this.progressService.calculateModuleAccess(
      new Types.ObjectId(userId),
      course._id,
      publishedModules as any,
      rawLessons,
    );

    const modules = publishedModules.map((mod) => {
      const access = accessInfo.modulesAccess.find(
        (a: any) => a.moduleId === mod._id.toString(),
      );

      // Helper to format duration
      const rawDurationMinutes = mod.estimatedTimeMinutes || 0;
      const formattedDuration = `${rawDurationMinutes} min`;

      const moduleLessons = rawLessons
        .filter((l: any) => {
          const lModId = l.moduleId?._id ? l.moduleId._id.toString() : l.moduleId.toString();
          return lModId === mod._id.toString();
        })
        .sort((a: any, b: any) => a.order - b.order)
        .map((l: any) => ({
          id: l._id.toString(),
          title: l.title,
          slug: l.slug,
          order: l.order,
          durationMinutes: l.durationMinutes || 5,
        }));

      return {
        id: mod._id.toString(),
        slug: mod.slug,
        title: mod.title,
        description: mod.description || '',
        order: mod.order,
        lessonCount: access?.totalLessons || 0,
        completedLessons: access?.completedLessons || [],
        estimatedDuration: formattedDuration || '0 min',
        progress: access?.progress || 0,
        locked: access?.locked !== false,
        completed: !!access?.completed,
        nextLessonId: access?.nextLessonId,
        available: access?.available ?? false,
        lessonsCompleted: access?.lessonsCompleted ?? false,
        quizAvailable: access?.quizAvailable ?? false,
        quizPassed: access?.quizPassed ?? false,
        quizFailed: access?.quizFailed ?? false,
        nextModuleUnlocked: access?.nextModuleUnlocked ?? false,
        lessons: moduleLessons,
      };
    });

    const totalLessons = rawLessons.length;
    const completedLessonIds = progressDoc.completedLessons || [];
    const computedProgress = totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0;
    const finalCourseProgress = Math.max(Math.round(progressDoc.percentage || 0), computedProgress);

    return {
      course: {
        id: course._id.toString(),
        title: course.title,
        progress: finalCourseProgress,
        completedModules: accessInfo.completedModules,
        totalModules: accessInfo.totalModules,
      },
      modules,
    };
  }

  async getModuleLessons(
    courseSlug: string,
    moduleSlug: string,
    userId: string,
  ): Promise<ModuleLessonsResponseDto> {
    const course = await this.courseModel
      .findOne({ slug: courseSlug, isDeleted: { $ne: true } })
      .exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const progressDoc = await this.progressService.getProgress(
      new Types.ObjectId(userId),
      course._id,
    );
    if (!progressDoc) {
      throw new BadRequestException('Student is not enrolled in this course');
    }

    // Fetch modules to evaluate lock status of target module
    const { data: rawModules } = await this.courseModulesService.findAll({
      courseId: course._id.toString(),
      limit: 100,
    });
    const publishedModules = rawModules.filter(
      (m) => m.status === 'published' && !m.isDeleted,
    );

    const targetModule = publishedModules.find((m) => m.slug === moduleSlug);
    if (!targetModule) {
      throw new NotFoundException('Module not found');
    }

    // Fetch all course lessons for module lock calculations
    const { data: allLessons } = await this.lessonsService.findAll({
      courseId: course._id.toString(),
      limit: 100,
    });

    const accessInfo = await this.progressService.calculateModuleAccess(
      new Types.ObjectId(userId),
      course._id,
      publishedModules as any,
      allLessons,
    );

    const moduleAccess = accessInfo.modulesAccess.find(
      (a: any) => a.moduleId === targetModule._id.toString(),
    );
    const isModuleLocked = moduleAccess ? moduleAccess.locked : true;

    // Fetch published lessons belonging to the target module sorted by order ASC
    const publishedLessons = allLessons
      .filter(
        (l: any) =>
          l.moduleId.toString() === targetModule._id.toString() &&
          l.status === 'published' &&
          !l.isDeleted,
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Calculate sequential lessons access
    const lessonsAccess = await this.progressService.calculateLessonsAccess(
      new Types.ObjectId(userId),
      course._id,
      publishedLessons,
      isModuleLocked,
    );

    const lessons = publishedLessons.map((les: any) => {
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
      };
    });

    return {
      module: {
        id: targetModule._id.toString(),
        title: targetModule.title,
        slug: targetModule.slug,
        description: targetModule.description || '',
      },
      lessons,
    };
  }

  async getLessonDetails(
    courseSlug: string,
    moduleSlug: string,
    lessonSlug: string,
    userId: string,
  ): Promise<any> {
    const course = await this.courseModel
      .findOne({ slug: courseSlug, isDeleted: { $ne: true } })
      .exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const progressDoc = await this.progressService.getProgress(
      new Types.ObjectId(userId),
      course._id,
    );
    if (!progressDoc) {
      throw new BadRequestException('Student is not enrolled in this course');
    }

    return this.lessonsService.getLessonDetailsForStudent(
      course,
      moduleSlug,
      lessonSlug,
      userId,
    );
  }
}
