/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardFacadeService } from './dashboard-facade.service';
import { RecommendationService } from './recommendation.service';
import { NotificationsService } from '../notifications/notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Types } from 'mongoose';

const mockDashboardService = {
  getContinueLearning: jest.fn(),
  getProgressSummary: jest.fn(),
  getRecentActivity: jest.fn(),
};

const mockRecommendationService = {
  getRecommendations: jest.fn(),
};

const mockNotificationsService = {
  getUserNotifications: jest.fn(),
};

const mockDashboardFacadeService = {
  getDashboard: jest.fn(),
};

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
        {
          provide: RecommendationService,
          useValue: mockRecommendationService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: DashboardFacadeService,
          useValue: mockDashboardFacadeService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getContinueLearning', () => {
    it('should successfully return continue learning data for valid user', async () => {
      const mockSub = new Types.ObjectId().toString();
      const mockResult = {
        courseId: new Types.ObjectId().toString(),
        courseTitle: 'React',
        courseSlug: 'react',
        courseThumbnail: 'thumb',
        moduleId: new Types.ObjectId().toString(),
        moduleTitle: 'Hooks',
        completionPercentage: 10,
        lastWatchedAt: new Date(),
        lastActivityAt: new Date(),
      };

      mockDashboardService.getContinueLearning.mockResolvedValue(mockResult);

      const response = await controller.getContinueLearning({ sub: mockSub });

      expect(mockDashboardService.getContinueLearning).toHaveBeenCalledWith(
        mockSub,
      );
      expect(response.success).toBe(true);
      expect(response.data.continueLearning).toEqual(mockResult);
    });

    it('should return null if user has no continue learning data', async () => {
      const mockSub = new Types.ObjectId().toString();

      mockDashboardService.getContinueLearning.mockResolvedValue(null);

      const response = await controller.getContinueLearning({ sub: mockSub });

      expect(mockDashboardService.getContinueLearning).toHaveBeenCalledWith(
        mockSub,
      );
      expect(response.success).toBe(true);
      expect(response.data.continueLearning).toBeNull();
    });
  });

  describe('getRecommendedCourses', () => {
    it('should return recommended courses on success', async () => {
      const mockResult: any = {
        topCourses: [],
        newestCourses: [],
        trendingCourses: [],
        roleBasedCourses: [],
        skillBasedCourses: [],
      };
      const mockSub = 'test-user-id';

      mockRecommendationService.getRecommendations.mockResolvedValue(
        mockResult,
      );

      const response = await controller.getRecommendedCourses({
        sub: mockSub,
      });

      expect(mockRecommendationService.getRecommendations).toHaveBeenCalledWith(
        mockSub,
      );
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockResult);
      expect(response.message).toBe('Recommendations fetched successfully');
    });
  });

  describe('getProgressSummary', () => {
    it('should return progress summary on success', async () => {
      const mockResult: any = {
        overallProgress: 50,
        completedCourses: 2,
        activeCourses: 3,
        totalTimeSpent: 120,
      };
      const mockSub = 'test-user-id';

      mockDashboardService.getProgressSummary.mockResolvedValue(mockResult);

      const response = await controller.getProgressSummary({ sub: mockSub });

      expect(mockDashboardService.getProgressSummary).toHaveBeenCalledWith(
        mockSub,
      );
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockResult);
      expect(response.message).toBe('Progress summary fetched successfully');
    });
  });

  describe('getRecentActivity', () => {
    it('should return recent activities on success', async () => {
      const mockQuery = { limit: 10 };
      const mockResult = {
        activities: [],
        total: 0,
        hasMore: false,
        nextCursor: null,
        generatedAt: new Date(),
      };

      mockDashboardService.getRecentActivity.mockResolvedValue(mockResult);

      const mockSub = 'test-user-id';
      const response = await controller.getRecentActivity(
        { sub: mockSub },
        mockQuery,
      );

      expect(mockDashboardService.getRecentActivity).toHaveBeenCalledWith(
        mockSub,
        mockQuery,
      );
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockResult);
      expect(response.message).toBe('Recent activity fetched successfully');
    });
  });

  describe('getNotifications', () => {
    it('should return notifications on success', async () => {
      const mockQuery = { page: 1, limit: 10 };
      const mockResult = {
        notifications: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasMore: false,
      };

      mockNotificationsService.getUserNotifications.mockResolvedValue(
        mockResult,
      );

      const mockSub = 'test-user-id';
      const response = await controller.getNotifications(
        { sub: mockSub, roleId: 'mockRoleId' },
        mockQuery,
      );

      expect(
        mockNotificationsService.getUserNotifications,
      ).toHaveBeenCalledWith(mockSub, mockQuery);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockResult);
      expect(response.message).toBe('Notifications fetched successfully');
    });
  });

  describe('getDashboard', () => {
    it('should return aggregated dashboard data', async () => {
      const mockSub = new Types.ObjectId().toString();
      const mockResult = {
        profile: { id: mockSub } as any,
        continueLearning: null,
        recommendedCourses: [],
        progress: {} as any,
        recentActivity: [],
        notifications: [],
        generatedAt: new Date(),
      };

      mockDashboardFacadeService.getDashboard.mockResolvedValue(mockResult);

      const response = await controller.getDashboard({
        sub: mockSub,
        roleId: 'mockRoleId',
      });

      expect(mockDashboardFacadeService.getDashboard).toHaveBeenCalledWith(
        mockSub,
        'mockRoleId',
      );
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockResult);
    });
  });
});
