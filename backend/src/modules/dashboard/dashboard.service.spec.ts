import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { Progress } from '../progress/schemas/progress.schema';
import { Course } from '../courses/schemas/course.schema';
import { CourseModule } from '../modules/schemas/module.schema';
import { Lesson } from '../lessons/schemas/lesson.schema';
import { ModuleCompletion } from '../progress/schemas/module-completion.schema';
import { ACTIVITY_PROVIDERS } from './interfaces/activity-provider.interface';
import { Types } from 'mongoose';

import { createQueryMock } from '../../common/utils/test-helpers';

const mockProgressModel = {
  findOne: jest.fn(),
  find: jest.fn(),
  updateOne: jest.fn(),
  aggregate: jest.fn(),
};

const mockCourseModel = {
  findOne: jest.fn(),
};

const mockModuleModel = {
  find: jest.fn(),
};

const mockLessonModel = {
  find: jest.fn(),
  aggregate: jest.fn(),
};

const mockModuleCompletionModel = {
  countDocuments: jest.fn().mockReturnValue({ exec: jest.fn() }),
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getModelToken(Progress.name), useValue: mockProgressModel },
        { provide: getModelToken(Course.name), useValue: mockCourseModel },
        {
          provide: getModelToken(CourseModule.name),
          useValue: mockModuleModel,
        },
        { provide: getModelToken(Lesson.name), useValue: mockLessonModel },
        {
          provide: getModelToken(ModuleCompletion.name),
          useValue: mockModuleCompletionModel,
        },
        {
          provide: ACTIVITY_PROVIDERS,
          useValue: [
            {
              getActivities: jest.fn().mockResolvedValue([]),
            },
          ],
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getContinueLearning', () => {
    it('should return null if no active progress found', async () => {
      mockProgressModel.findOne.mockReturnValue(createQueryMock(null));

      const res = await service.getContinueLearning(new Types.ObjectId().toHexString());
      expect(res).toBeNull();
    });

    it('should return continue learning data when progress exists', async () => {
      const courseId = new Types.ObjectId();
      const moduleId = new Types.ObjectId();
      const lessonId = new Types.ObjectId();

      mockProgressModel.findOne.mockReturnValue(createQueryMock({
        _id: new Types.ObjectId(),
        courseId,
        completedLessons: [],
        lastAccessedModuleId: moduleId,
        percentage: 25,
        lastAccessedAt: new Date(),
        updatedAt: new Date(),
      }));

      mockCourseModel.findOne.mockReturnValue(createQueryMock({
        _id: courseId,
        title: 'Java',
        slug: 'java',
        thumbnail: 'thumb.jpg',
      }));

      mockModuleModel.find.mockReturnValue(createQueryMock([
        { _id: moduleId, title: 'Module 1', slug: 'module-1', order: 1 },
      ]));

      mockLessonModel.find.mockReturnValue(createQueryMock([
        {
          _id: lessonId,
          title: 'Lesson 1',
          slug: 'lesson-1',
          moduleId,
          order: 1,
          type: 'video',
        },
      ]));

      const res = await service.getContinueLearning(new Types.ObjectId().toHexString());
      expect(res).not.toBeNull();
      expect(res!.courseTitle).toBe('Java');
      expect(res!.moduleTitle).toBe('Module 1');
    });
  });

  describe('getProgressSummary', () => {
    it('should return a progress summary via aggregation', async () => {
      mockProgressModel.aggregate.mockResolvedValue([
        {
          coursesEnrolled: 3,
          coursesCompleted: 1,
          totalPercentage: 120,
          allCompletedLessonIds: [
            [new Types.ObjectId(), new Types.ObjectId()],
            [new Types.ObjectId()],
          ],
        },
      ]);

      mockModuleCompletionModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const res = await service.getProgressSummary(new Types.ObjectId().toHexString());
      expect(res).toBeDefined();
      expect(res.coursesEnrolled).toBe(3);
      expect(res.coursesCompleted).toBe(1);
    });
  });
});
