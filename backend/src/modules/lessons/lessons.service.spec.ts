/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { LessonsService } from './lessons.service';
import { Lesson } from './schemas/lesson.schema';
import { CourseModule } from '../modules/schemas/module.schema';
import { ProgressService } from '../progress/progress.service';
import { SlugService } from '../../common/services/slug.service';
import { LessonNotesService } from '../lesson-notes/lesson-notes.service';

const fakeId = new Types.ObjectId().toHexString();
const moduleId = new Types.ObjectId().toHexString();
const userId = new Types.ObjectId().toHexString();

function buildLesson(overrides: Partial<any> = {}): any {
  return {
    _id: new Types.ObjectId(),
    title: 'Lesson 1',
    slug: 'lesson-1',
    order: 1,
    moduleId: new Types.ObjectId(moduleId),
    isDeleted: false,
    ...overrides,
  };
}

function mockLessonModel() {
  const save = jest.fn().mockResolvedValue(buildLesson());
  const instance = { save };
  const Model: any = jest.fn().mockImplementation(() => instance);

  Model.findOne = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  });
  Model.find = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([buildLesson()]),
  });
  Model.findOneAndUpdate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(buildLesson()),
  });
  Model.countDocuments = jest.fn().mockResolvedValue(1);
  Model.exists = jest.fn().mockResolvedValue(null);

  return Model;
}

function mockCourseModuleModel() {
  const Model: any = jest.fn().mockImplementation(() => ({}));
  Model.findOne = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({
      _id: new Types.ObjectId(moduleId),
      courseId: new Types.ObjectId(),
      title: 'Module 1',
      slug: 'module-1',
      isDeleted: false,
    }),
  });
  Model.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([
      {
        _id: new Types.ObjectId(moduleId),
      },
    ]),
  });
  return Model;
}

function mockProgressService() {
  return {
    markLessonComplete: jest.fn().mockResolvedValue(undefined),
    recalculatePercentage: jest.fn().mockResolvedValue(undefined),
    checkEnrollment: jest.fn().mockResolvedValue(true),
    calculateModuleAccess: jest.fn().mockResolvedValue({
      completedModules: 0,
      totalModules: 1,
      modulesAccess: [
        {
          moduleId: new Types.ObjectId(moduleId).toString(),
          completedLessons: [],
          totalLessons: 1,
          progress: 0,
          locked: false,
          completed: false,
        },
      ],
    }),
    calculateLessonsAccess: jest.fn().mockResolvedValue([
      {
        lessonId: new Types.ObjectId().toString(), // will be overridden per test
        completed: false,
        locked: false,
      },
    ]),
    getProgress: jest.fn().mockResolvedValue({ percentage: 20 }),
    trackViewedLesson: jest.fn().mockResolvedValue(undefined),
  };
}

function mockSlugService(): jest.Mocked<SlugService> {
  return {
    generate: jest.fn().mockReturnValue('lesson-1'),
    generateUnique: jest.fn().mockResolvedValue('lesson-1'),
  } as any;
}

function mockLessonNotesService() {
  return {
    findByLessonId: jest
      .fn()
      .mockResolvedValue({ content: 'Lesson notes rich text content' }),
  };
}

describe('LessonsService', () => {
  let service: LessonsService;
  let lessonModel: ReturnType<typeof mockLessonModel>;
  let courseModuleModel: ReturnType<typeof mockCourseModuleModel>;
  let progressService: ReturnType<typeof mockProgressService>;
  let slugService: jest.Mocked<SlugService>;
  let lessonNotesService: ReturnType<typeof mockLessonNotesService>;

  beforeEach(async () => {
    lessonModel = mockLessonModel();
    courseModuleModel = mockCourseModuleModel();
    progressService = mockProgressService();
    slugService = mockSlugService();
    lessonNotesService = mockLessonNotesService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        { provide: getModelToken(Lesson.name), useValue: lessonModel },
        {
          provide: getModelToken(CourseModule.name),
          useValue: courseModuleModel,
        },
        { provide: ProgressService, useValue: progressService },
        { provide: SlugService, useValue: slugService },
        { provide: LessonNotesService, useValue: lessonNotesService },
      ],
    }).compile();

    service = module.get<LessonsService>(LessonsService);
  });

  describe('create()', () => {
    const dto = {
      title: 'Lesson 1',
      youtubeUrl: 'https://www.youtube.com/embed/grEKMHGYyns',
      moduleId,
      order: 1,
    } as any;

    it('creates lesson successfully', async () => {
      const result = await service.create(dto, userId);
      expect(result).toBeDefined();
    });

    it('throws BadRequestException on order conflict', async () => {
      lessonModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(buildLesson()),
      });
      await expect(service.create(dto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('tests the exists check callback passed to SlugService.generateUnique', async () => {
      let callback: (candidate: string) => Promise<boolean>;
      slugService.generateUnique.mockImplementationOnce((title, cb) => {
        callback = cb;
        return Promise.resolve('lesson-1');
      });

      await service.create(dto, userId);
      expect(callback).toBeDefined();

      lessonModel.exists.mockResolvedValueOnce({ _id: new Types.ObjectId() });
      const exists = await callback('test');
      expect(exists).toBe(true);
    });
  });

  describe('findAll()', () => {
    it('returns filtered and sorted list of lessons', async () => {
      const result = await service.findAll({ page: 1, limit: 10, moduleId });
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
    });

    it('filters by courseId if supplied', async () => {
      const result = await service.findAll({
        page: 1,
        limit: 10,
        courseId: fakeId,
      });
      expect(result).toHaveProperty('data');
      expect(courseModuleModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('returns one lesson by id', async () => {
      lessonModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(buildLesson()),
      });
      const result = await service.findOne(fakeId);
      expect(result).toBeDefined();
    });

    it('throws NotFoundException if lesson not found', async () => {
      lessonModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.findOne(fakeId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('updates lesson details', async () => {
      const result = await service.update(
        fakeId,
        {
          title: 'Updated',
          youtubeUrl: 'https://www.youtube.com/embed/grEKMHGYyns',
        },
        userId,
      );
      expect(result).toBeDefined();
    });

    it('throws NotFoundException on update target conflict', async () => {
      lessonModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(
        service.update(fakeId, { title: 'Updated' }, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('soft-deletes lesson successfully', async () => {
      await service.remove(fakeId, userId);
      expect(lessonModel.findOneAndUpdate).toHaveBeenCalled();
    });

    it('throws NotFoundException on soft-delete target conflict', async () => {
      lessonModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.remove(fakeId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('completeLesson()', () => {
    it('completes lesson and triggers progress recalculation when unlocked', async () => {
      const lesson = buildLesson();
      lessonModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(lesson),
      });
      // calculateLessonsAccess returns unlocked entry matching the lesson
      progressService.calculateLessonsAccess.mockResolvedValueOnce([
        { lessonId: lesson._id.toString(), completed: false, locked: false },
      ]);
      await service.completeLesson(fakeId, userId);
      expect(progressService.markLessonComplete).toHaveBeenCalled();
      expect(progressService.recalculatePercentage).toHaveBeenCalled();
    });

    it('throws NotFoundException if lesson not found', async () => {
      lessonModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.completeLesson(fakeId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException if module not found', async () => {
      lessonModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(buildLesson()),
      });
      courseModuleModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.completeLesson(fakeId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException if student is not enrolled', async () => {
      lessonModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(buildLesson()),
      });
      progressService.checkEnrollment.mockResolvedValueOnce(false);
      await expect(service.completeLesson(fakeId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws ForbiddenException if lesson is locked', async () => {
      const lesson = buildLesson();
      lessonModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(lesson),
      });
      progressService.checkEnrollment.mockResolvedValueOnce(true);
      // Return locked access for this lesson
      progressService.calculateLessonsAccess.mockResolvedValueOnce([
        { lessonId: lesson._id.toString(), completed: false, locked: true },
      ]);
      await expect(service.completeLesson(fakeId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getLessonDetailsForStudent()', () => {
    it('returns full lesson details including note content, sister lessons, navigation, and progress', async () => {
      const mockModule = {
        _id: new Types.ObjectId(),
        title: 'Mock Module',
        slug: 'mock-module',
        description: 'Desc',
        order: 1,
      };

      const mockLesson = buildLesson({
        moduleId: mockModule._id,
        slug: 'lesson-1',
      });

      courseModuleModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockModule),
      });

      lessonModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockLesson),
      });

      courseModuleModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([mockModule]),
      });

      lessonModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([mockLesson]),
      });

      progressService.calculateModuleAccess.mockResolvedValueOnce({
        completedModules: 0,
        totalModules: 1,
        modulesAccess: [
          {
            moduleId: mockModule._id.toString(),
            completedLessons: [],
            totalLessons: 1,
            progress: 0,
            locked: false,
            completed: false,
          },
        ],
      });

      progressService.calculateLessonsAccess.mockResolvedValueOnce([
        {
          lessonId: mockLesson._id.toString(),
          completed: false,
          locked: false,
        },
      ]);

      const mockCourse = {
        _id: new Types.ObjectId(),
        title: 'Java Basics',
        slug: 'java-basics',
      };

      const result = await service.getLessonDetailsForStudent(
        mockCourse,
        'mock-module',
        'lesson-1',
        userId,
      );

      expect(result).toBeDefined();
      expect(result.lesson).toHaveProperty('title', 'Lesson 1');
      expect(result.lesson).toHaveProperty(
        'notes',
        'Lesson notes rich text content',
      );
      expect(result.sisterLessons).toHaveLength(1);
    });
  });
});
