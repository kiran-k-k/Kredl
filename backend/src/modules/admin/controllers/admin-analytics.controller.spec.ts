import { Test, TestingModule } from '@nestjs/testing';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { QuizService } from '../../quiz/quiz.service';

describe('AdminAnalyticsController', () => {
  let controller: AdminAnalyticsController;
  let quizService: QuizService;

  const mockQuizService = {
    getQuizzesAnalytics: jest.fn().mockResolvedValue([
      {
        quizId: 'quiz-1',
        quizName: 'Quiz 1',
        moduleName: 'Module 1',
        courseName: 'Course 1',
        totalAttempts: 10,
        avgScore: 8.5,
        highestScore: 10,
        lowestScore: 5,
        passCount: 8,
        failCount: 2,
        passRate: 80,
        failRate: 20,
      },
    ]),
    getMostMissedQuestionsAnalytics: jest.fn().mockResolvedValue([
      {
        questionId: 'q-1',
        incorrectCount: 5,
        incorrectPercentage: 50,
        quizTitle: 'Quiz 1',
        moduleTitle: 'Module 1',
        questionText: 'What is Jest?',
        correctAnswer: 'A test runner',
      },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAnalyticsController],
      providers: [
        {
          provide: QuizService,
          useValue: mockQuizService,
        },
      ],
    }).compile();

    controller = module.get<AdminAnalyticsController>(AdminAnalyticsController);
    quizService = module.get<QuizService>(QuizService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getQuizzesAnalytics', () => {
    it('should return aggregated quiz analytics statistics', async () => {
      const response = await controller.getQuizzesAnalytics();
      expect(response.success).toBe(true);
      expect(response.data).toEqual([
        {
          quizId: 'quiz-1',
          quizName: 'Quiz 1',
          moduleName: 'Module 1',
          courseName: 'Course 1',
          totalAttempts: 10,
          avgScore: 8.5,
          highestScore: 10,
          lowestScore: 5,
          passCount: 8,
          failCount: 2,
          passRate: 80,
          failRate: 20,
        },
      ]);
      expect(quizService.getQuizzesAnalytics).toHaveBeenCalled();
    });
  });

  describe('getMostMissedQuestions', () => {
    it('should return most missed questions report', async () => {
      const response = await controller.getMostMissedQuestions();
      expect(response.success).toBe(true);
      expect(response.data).toEqual([
        {
          questionId: 'q-1',
          incorrectCount: 5,
          incorrectPercentage: 50,
          quizTitle: 'Quiz 1',
          moduleTitle: 'Module 1',
          questionText: 'What is Jest?',
          correctAnswer: 'A test runner',
        },
      ]);
      expect(quizService.getMostMissedQuestionsAnalytics).toHaveBeenCalled();
    });
  });
});
