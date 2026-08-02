import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { QuizService } from './quiz.service';
import { Quiz } from './schemas/quiz.schema';
import { QuizAttempt } from './schemas/quiz-attempt.schema';
import { CourseModule } from '../modules/schemas/module.schema';
import { Progress } from '../progress/schemas/progress.schema';
import { Lesson } from '../lessons/schemas/lesson.schema';
import { ModuleCompletion } from '../progress/schemas/module-completion.schema';
import { AdminActionsLog } from '../admin-actions-log/schemas/admin-actions-log.schema';
import { ProgressService } from '../progress/progress.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

const moduleId = new Types.ObjectId();
const courseId = new Types.ObjectId();
const userId = new Types.ObjectId();
const quizId = new Types.ObjectId();
const questionId1 = new Types.ObjectId();

const mockQuiz = {
  _id: quizId,
  moduleId,
  title: 'React Patterns Quiz',
  passingScorePercentage: 70,
  timeLimitMinutes: 15,
  maxAttempts: 3,
  cooldownMinutes: 1440,
  isPublished: true,
  questions: [
    {
      _id: questionId1,
      questionText: 'What is a Hook?',
      options: ['Option A', 'Option B', 'Option C'],
      correctAnswerIndex: 0,
      explanation: 'Explanation',
    },
  ],
  save: jest.fn().mockImplementation(function (this: any) {
    return Promise.resolve(this);
  }),
};

const mockModule = {
  _id: moduleId,
  courseId,
  title: 'Advanced React',
  slug: 'advanced-react',
  status: 'published',
  isDeleted: false,
};

const mockQuizModel = {
  findOne: jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue(mockQuiz),
    then: jest.fn().mockImplementation((resolve) => resolve(mockQuiz)),
  })),
  findOneAndUpdate: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockQuiz),
  }),
  create: jest.fn(),
  save: jest.fn(),
};

const mockQuizAttemptModel = {
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  }),
  findOne: jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue(null),
    then: jest.fn().mockImplementation((resolve) => resolve(null)),
  })),
  create: jest.fn(),
};

const mockModuleModel = {
  findOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockModule),
  }),
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockModule]),
  }),
};

const mockProgressModel = {
  findOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({
      completedLessons: [],
    }),
  }),
};

const mockLessonModel = {
  find: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([]),
  }),
  countDocuments: jest.fn().mockResolvedValue(0),
};

const mockModuleCompletionModel = {
  updateOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({}),
  }),
};

const mockAdminLogModel = {
  create: jest.fn(),
};

const mockProgressService = {
  checkEnrollment: jest.fn().mockResolvedValue(true),
  calculateModuleAccess: jest.fn().mockResolvedValue({
    modulesAccess: [
      {
        moduleId: moduleId.toString(),
        locked: false,
      },
    ],
  }),
  getProgress: jest.fn().mockResolvedValue({
    completedLessons: [],
  }),
  recalculatePercentage: jest.fn().mockResolvedValue(undefined),
};

describe('QuizService', () => {
  let service: QuizService;

  beforeEach(async () => {
    mockQuizModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(mockQuiz),
      then: jest.fn().mockImplementation((resolve) => resolve(mockQuiz)),
    }));
    mockQuizAttemptModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
      then: jest.fn().mockImplementation((resolve) => resolve(null)),
    }));

    // Standard mock class instantiation for model creation simulation
    const ModelMock = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ _id: quizId, ...dto }),
    }));
    Object.assign(ModelMock, mockQuizModel);

    const AttemptMock = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(), ...dto }),
    }));
    Object.assign(AttemptMock, mockQuizAttemptModel);

    const LogMock = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({}),
    }));
    Object.assign(LogMock, mockAdminLogModel);

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        { provide: getModelToken(Quiz.name), useValue: ModelMock },
        { provide: getModelToken(QuizAttempt.name), useValue: AttemptMock },
        {
          provide: getModelToken(CourseModule.name),
          useValue: mockModuleModel,
        },
        { provide: getModelToken(Progress.name), useValue: mockProgressModel },
        { provide: getModelToken(Lesson.name), useValue: mockLessonModel },
        {
          provide: getModelToken(ModuleCompletion.name),
          useValue: mockModuleCompletionModel,
        },
        { provide: getModelToken(AdminActionsLog.name), useValue: LogMock },
        { provide: ProgressService, useValue: mockProgressService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createQuiz()', () => {
    it('creates a quiz successfully', async () => {
      mockModuleModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockModule),
      });
      mockQuizModel.findOne.mockReturnValueOnce(null);

      const dto: CreateQuizDto = {
        moduleId: moduleId.toString(),
        title: 'React Patterns Quiz',
        questions: [
          {
            questionText: 'What is a Hook?',
            options: ['Option A', 'Option B', 'Option C'],
            correctAnswerIndex: 0,
          },
        ],
      };

      const result = await service.createQuiz(dto, userId.toString());
      expect(result).toBeDefined();
      expect(result.title).toBe(dto.title);
    });

    it('throws BadRequestException if quiz already exists', async () => {
      mockModuleModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockModule),
      });
      mockQuizModel.findOne.mockReturnValueOnce(mockQuiz);

      const dto: CreateQuizDto = {
        moduleId: moduleId.toString(),
        title: 'Duplicate Quiz',
        questions: [],
      };

      await expect(service.createQuiz(dto, userId.toString())).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('submitAttempt()', () => {
    it('submits and grades attempt successfully', async () => {
      mockModuleModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockModule),
      });
      mockQuizModel.findOne.mockReturnValueOnce(mockQuiz);
      mockQuizAttemptModel.find.mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const dto: SubmitAttemptDto = {
        answers: [
          {
            questionId: questionId1.toString(),
            selectedAnswerIndex: 0, // correct option index
          },
        ],
        timeTakenSeconds: 30,
      };

      const result = await service.submitAttempt(
        'advanced-react',
        userId.toString(),
        dto,
      );
      expect(result).toBeDefined();
      expect(result.passed).toBe(true);
      expect(result.score).toBe(1);
    });

    it('throws ForbiddenException if student is not enrolled', async () => {
      mockModuleModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockModule),
      });
      mockProgressService.checkEnrollment.mockResolvedValueOnce(false);

      const dto: SubmitAttemptDto = {
        answers: [],
        timeTakenSeconds: 10,
      };

      await expect(
        service.submitAttempt('advanced-react', userId.toString(), dto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getQuizByIdForStudent()', () => {
    it('returns sanitized quiz and orders questions correctly', async () => {
      mockModuleModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockModule),
      });
      mockQuizModel.findOne.mockResolvedValueOnce({
        ...mockQuiz,
        questions: [
          {
            _id: questionId1,
            order: 1,
            questionText: 'Q1',
            options: ['A', 'B'],
          },
          {
            _id: new Types.ObjectId(),
            order: 0,
            questionText: 'Q0',
            options: ['C', 'D'],
          },
        ],
      });

      const result = await service.getQuizByIdForStudent(
        moduleId.toString(),
        userId.toString(),
      );
      expect(result).toBeDefined();
      expect(result.questions[0].questionText).toBe('Q0'); // ordered first
      expect(result.questions[0].correctAnswerIndex).toBeUndefined(); // answers hidden
    });
  });

  describe('startQuizAttempt()', () => {
    it('creates a new in-progress attempt successfully', async () => {
      mockModuleModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockModule),
      });
      mockQuizModel.findOne.mockResolvedValueOnce(mockQuiz);
      mockQuizAttemptModel.find.mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
        then: jest.fn().mockImplementation((resolve) => resolve([])),
      } as any);

      const result = await service.startQuizAttempt(
        moduleId.toString(),
        userId.toString(),
      );
      expect(result).toBeDefined();
      expect(result.attemptId).toBeDefined();
      expect(result.totalQuestions).toBe(1);
    });
  });

  describe('submitQuizAttempt()', () => {
    it('successfully submits and grades an in-progress attempt', async () => {
      const mockAttempt = {
        _id: new Types.ObjectId(),
        userId: userId,
        quizId: quizId,
        moduleId: moduleId,
        status: 'IN_PROGRESS',
        startedAt: new Date(Date.now() - 60000), // 1 min ago
        save: jest.fn().mockImplementation(function () {
          return this;
        }),
      };

      mockQuizAttemptModel.findOne.mockResolvedValueOnce(mockAttempt);
      mockQuizModel.findOne.mockResolvedValueOnce(mockQuiz);
      mockModuleModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockModule),
      });
      mockLessonModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.submitQuizAttempt(
        mockAttempt._id.toString(),
        [{ questionId: questionId1.toString(), selectedAnswerIndex: 0 }],
        userId.toString(),
      );

      expect(result).toBeDefined();
      expect(result.passed).toBe(true);
      expect(result.score).toBe(1);
    });
  });

  describe('getQuizResult()', () => {
    it('returns full graded details with explanations after submission', async () => {
      const mockAttempt = {
        _id: new Types.ObjectId(),
        userId: userId,
        quizId: quizId,
        moduleId: moduleId,
        status: 'COMPLETED',
        score: 1,
        percentage: 100,
        passed: true,
        answers: [
          { questionId: questionId1, selectedAnswerIndex: 0, isCorrect: true },
        ],
      };

      mockQuizAttemptModel.findOne.mockResolvedValueOnce(mockAttempt);
      mockQuizModel.findOne.mockResolvedValueOnce(mockQuiz);

      const result = await service.getQuizResult(
        mockAttempt._id.toString(),
        userId.toString(),
      );
      expect(result).toBeDefined();
      expect(result.correct).toBe(1);
      expect(result.answers[0].correctAnswerIndex).toBe(0); // correct answers included
      expect(result.answers[0].explanation).toBeDefined(); // explanation included
    });
  });

  describe('publishQuiz()', () => {
    it('publishes quiz successfully if questions exist', async () => {
      mockQuizModel.findOne.mockReturnValueOnce({
        ...mockQuiz,
        save: jest.fn().mockResolvedValue({ ...mockQuiz, isPublished: true }),
      });

      const result = await service.publishQuiz(
        quizId.toString(),
        userId.toString(),
      );
      expect(result).toBeDefined();
      expect(result.isPublished).toBe(true);
    });

    it('throws BadRequestException if quiz has no questions', async () => {
      mockQuizModel.findOne.mockReturnValueOnce({
        ...mockQuiz,
        questions: [],
        save: jest.fn(),
      });

      await expect(
        service.publishQuiz(quizId.toString(), userId.toString()),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('question management', () => {
    it('throws BadRequestException on duplicate options when adding question', async () => {
      mockQuizModel.findOne.mockReturnValueOnce(mockQuiz);

      const dto = {
        questionText: 'Duplicate options test',
        options: ['Same option', 'Same option', 'Unique option'],
        correctAnswerIndex: 0,
      };

      await expect(
        service.addQuestion(quizId.toString(), dto, userId.toString()),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('analytics', () => {
    it('calls aggregate on quizModel for quizzes analytics', async () => {
      const mockAggregate = {
        exec: jest.fn().mockResolvedValue([{ quizId: 'quiz-1' }]),
      };
      (service as any).quizModel.aggregate = jest
        .fn()
        .mockReturnValue(mockAggregate);

      const result = await service.getQuizzesAnalytics();
      expect(result).toEqual([{ quizId: 'quiz-1' }]);
      expect((service as any).quizModel.aggregate).toHaveBeenCalled();
    });

    it('calls aggregate on quizAttemptModel for most missed questions analytics', async () => {
      const mockAggregate = {
        exec: jest.fn().mockResolvedValue([{ questionId: 'q-1' }]),
      };
      (service as any).quizAttemptModel.aggregate = jest
        .fn()
        .mockReturnValue(mockAggregate);

      const result = await service.getMostMissedQuestionsAnalytics();
      expect(result).toEqual([{ questionId: 'q-1' }]);
      expect((service as any).quizAttemptModel.aggregate).toHaveBeenCalled();
    });
  });
});
