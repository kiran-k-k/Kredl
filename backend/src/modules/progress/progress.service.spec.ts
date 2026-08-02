import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProgressService } from './progress.service';
import { Progress, ProgressStatus } from './schemas/progress.schema';
import { Course } from '../courses/schemas/course.schema';
import { CourseModule } from '../modules/schemas/module.schema';
import { Lesson } from '../lessons/schemas/lesson.schema';
import { ModuleCompletion } from './schemas/module-completion.schema';
import { Quiz } from '../quiz/schemas/quiz.schema';
import { QuizAttempt } from '../quiz/schemas/quiz-attempt.schema';
import { Types } from 'mongoose';
import { ProgressCalculationService } from './progress-calculation.service';

const mockProgressCalculationService = {
  recalculatePercentage: jest.fn(),
  calculateModuleAccess: jest.fn(),
  calculateLessonsAccess: jest.fn(),
};

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
  countDocuments: jest.fn(),
};

const mockQuizModel = {};
const mockQuizAttemptModel = {};

describe('ProgressService', () => {
  let service: ProgressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        {
          provide: ProgressCalculationService,
          useValue: mockProgressCalculationService,
        },
        { provide: getModelToken(Progress.name), useValue: mockProgressModel },
        {
          provide: getModelToken(ModuleCompletion.name),
          useValue: mockModuleCompletionModel,
        },
        { provide: getModelToken(Quiz.name), useValue: mockQuizModel },
        {
          provide: getModelToken(QuizAttempt.name),
          useValue: mockQuizAttemptModel,
        },
        { provide: getModelToken(Course.name), useValue: mockCourseModel },
        {
          provide: getModelToken(CourseModule.name),
          useValue: mockModuleModel,
        },
        { provide: getModelToken(Lesson.name), useValue: mockLessonModel },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
