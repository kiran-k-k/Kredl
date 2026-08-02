/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CoursesService } from './courses.service';

const fakeId = new Types.ObjectId().toHexString();
const userId = new Types.ObjectId().toHexString();

function buildCourse(overrides: Partial<any> = {}): any {
  return {
    _id: new Types.ObjectId(),
    title: 'Test Course',
    slug: 'test-course',
    status: 'published',
    isPublished: true,
    isDeleted: false,
    category: 'Software Development',
    difficulty: 'Beginner',
    displayOrder: 1,
    toObject: function () {
      return this;
    },
    ...overrides,
  };
}

function mockCourseModel(overrides: Partial<any> = {}) {
  const save = jest.fn().mockResolvedValue(buildCourse());
  const instance = { save };

  const Model: any = jest.fn().mockImplementation(() => instance);
  Model.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([buildCourse()]),
  });
  Model.findOne = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(buildCourse()),
  });
  Model.findOneAndUpdate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(buildCourse()),
  });
  Model.updateOne = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ nModified: 1 }),
  });
  Model.countDocuments = jest.fn().mockResolvedValue(1);

  // CRITICAL: Return null by default to avoid infinite while loops during slug generation
  Model.exists = jest.fn().mockResolvedValue(null);

  Object.assign(Model, overrides);
  return Model;
}

describe('CoursesService', () => {
  let service: CoursesService;
  let courseModel: any;
  let slugService: any;
  let courseModulesService: any;
  let lessonsService: any;
  let progressService: any;

  beforeEach(() => {
    courseModel = mockCourseModel();
    slugService = {
      generate: jest.fn().mockReturnValue('test-course'),
      generateUnique: jest.fn().mockResolvedValue('test-course'),
    };

    courseModulesService = {
      findAll: jest.fn().mockResolvedValue({
        data: [
          {
            _id: new Types.ObjectId(),
            title: 'Module 1',
            slug: 'module-1',
            description: 'Description 1',
            order: 1,
            estimatedDuration: '45 Minutes',
            isPublished: true,
          },
        ],
        total: 1,
      }),
    };

    lessonsService = {
      findAll: jest.fn().mockResolvedValue({
        data: [
          {
            _id: new Types.ObjectId(),
            title: 'Lesson 1',
            moduleId: new Types.ObjectId(),
            slug: 'lesson-1',
            order: 1,
          },
        ],
        total: 1,
      }),
      getLessonDetailsForStudent: jest.fn().mockResolvedValue({
        course: { title: 'Java Basics' },
        module: { title: 'Variables' },
        lesson: { title: 'Primitive Types', notes: 'Notes' },
        sisterLessons: [],
        navigation: { isLastLesson: false },
        progress: {
          lessonCompleted: false,
          moduleProgress: 0,
          courseProgress: 0,
        },
      }),
    };

    progressService = {
      enrollUser: jest.fn().mockResolvedValue(undefined),
      checkEnrollment: jest.fn().mockResolvedValue(false),
      getProgress: jest.fn().mockResolvedValue({
        userId: new Types.ObjectId(userId),
        courseId: new Types.ObjectId(),
        completedLessons: [],
        percentage: 50,
      }),
      calculateModuleAccess: jest.fn().mockResolvedValue({
        completedModules: 0,
        totalModules: 1,
        modulesAccess: [
          {
            moduleId: new Types.ObjectId().toString(),
            completedLessons: [],
            totalLessons: 1,
            progress: 0,
            locked: false,
            completed: false,
            nextLessonId: new Types.ObjectId().toString(),
          },
        ],
      }),
      calculateLessonsAccess: jest.fn().mockResolvedValue([
        {
          lessonId: new Types.ObjectId().toString(),
          completed: false,
          locked: false,
        },
      ]),
    };

    service = new CoursesService(
      courseModel,
      slugService,
      courseModulesService,
      lessonsService,
      progressService,
    );
  });

  describe('create()', () => {
    const dto = {
      title: 'Test Course',
      description: 'Desc',
      difficulty: 'Beginner',
      category: 'Software Development',
      estimatedDuration: '6 Months',
      thumbnail: 'https://thumbnail.com',
    } as any;

    it('calls SlugService.generate with the course title', async () => {
      await service.create(dto, userId);
      expect(slugService.generate).toHaveBeenCalledWith('Test Course');
    });

    it('handles slug collisions by appending incrementing suffix', async () => {
      courseModel.exists
        .mockResolvedValueOnce({ _id: new Types.ObjectId() })
        .mockResolvedValueOnce({ _id: new Types.ObjectId() })
        .mockResolvedValueOnce(null);

      slugService.generate.mockReturnValueOnce('test-course');

      const result = await service.create(dto, userId);
      expect(result).toBeDefined();
      expect(courseModel.exists).toHaveBeenCalledTimes(3);
    });
  });

  describe('enroll()', () => {
    it('creates progress document and increments enrollment count', async () => {
      courseModel.exists.mockResolvedValueOnce({ _id: new Types.ObjectId() });
      const result = await service.enroll(fakeId, userId);
      expect(result).toBeUndefined();
    });

    it('throws NotFoundException if course not found', async () => {
      courseModel.exists.mockResolvedValueOnce(null);
      await expect(service.enroll(fakeId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCourseModules()', () => {
    it('returns structured course modules access info', async () => {
      const result = await service.getCourseModules(fakeId, userId);
      expect(result).toBeDefined();
      expect(result.course).toHaveProperty('progress');
      expect(result.modules).toBeDefined();
    });

    it('throws NotFoundException if course does not exist', async () => {
      courseModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.getCourseModules(fakeId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException if student is not enrolled', async () => {
      progressService.getProgress.mockResolvedValueOnce(null);
      await expect(service.getCourseModules(fakeId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getModuleLessons()', () => {
    it('returns structured module lessons with completion and locked states', async () => {
      courseModulesService.findAll.mockResolvedValueOnce({
        data: [
          {
            _id: new Types.ObjectId(),
            title: 'Module 1',
            slug: 'module-1',
            description: 'Desc',
            order: 1,
            estimatedTimeMinutes: 45,
            status: 'published',
            isDeleted: false,
          },
        ],
        total: 1,
      });

      const result = await service.getModuleLessons(
        'test-course',
        'module-1',
        userId,
      );
      expect(result).toBeDefined();
      expect(result).toHaveProperty('module');
      expect(result).toHaveProperty('lessons');
      expect(Array.isArray(result.lessons)).toBe(true);
    });

    it('throws NotFoundException if course does not exist', async () => {
      courseModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(
        service.getModuleLessons('test-course', 'module-1', userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if student is not enrolled', async () => {
      progressService.getProgress.mockResolvedValueOnce(null);
      await expect(
        service.getModuleLessons('test-course', 'module-1', userId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getLessonDetails()', () => {
    it('returns full lesson details from LessonsService', async () => {
      const mockCourse = {
        _id: new Types.ObjectId(),
        title: 'Java Basics',
        slug: 'java-basics',
      };

      courseModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const result = await service.getLessonDetails(
        'java-basics',
        'variables',
        'primitive-types',
        userId,
      );
      expect(result).toBeDefined();
      expect(lessonsService.getLessonDetailsForStudent).toHaveBeenCalledWith(
        mockCourse,
        'variables',
        'primitive-types',
        userId,
      );
    });

    it('throws NotFoundException if course does not exist', async () => {
      courseModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(
        service.getLessonDetails(
          'java-basics',
          'variables',
          'primitive-types',
          userId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if student is not enrolled', async () => {
      courseModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
      });
      progressService.getProgress.mockResolvedValueOnce(null);
      await expect(
        service.getLessonDetails(
          'java-basics',
          'variables',
          'primitive-types',
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
