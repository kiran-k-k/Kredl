import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RecommendationService } from './recommendation.service';
import { RECOMMENDATION_PROVIDER } from './interfaces/recommendation-provider.interface';
import { User } from '../users/schemas/user.schema';
import { Progress } from '../progress/schemas/progress.schema';
import { Types } from 'mongoose';

const mockProvider = {
  getTopCourses: jest.fn(),
  getNewestCourses: jest.fn(),
  getTrendingCourses: jest.fn(),
  getRoleBasedCourses: jest.fn(),
  getSkillBasedCourses: jest.fn(),
};

const mockUserModel = {
  findById: jest.fn(),
};

const mockProgressModel = {
  find: jest.fn(),
};

describe('RecommendationService', () => {
  let service: RecommendationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationService,
        {
          provide: RECOMMENDATION_PROVIDER,
          useValue: mockProvider,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Progress.name),
          useValue: mockProgressModel,
        },
      ],
    }).compile();

    service = module.get<RecommendationService>(RecommendationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRecommendations', () => {
    const userId = new Types.ObjectId().toString();
    const roleId = new Types.ObjectId().toString();

    it('should return all categories of recommendations successfully', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ _id: userId, roleId }),
      });
      mockProgressModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const mockCourses = [{ courseId: '1', title: 'Course 1' }];

      mockProvider.getTopCourses.mockResolvedValue(mockCourses);
      mockProvider.getNewestCourses.mockResolvedValue(mockCourses);
      mockProvider.getTrendingCourses.mockResolvedValue(mockCourses);
      mockProvider.getRoleBasedCourses.mockResolvedValue(mockCourses);
      mockProvider.getSkillBasedCourses.mockResolvedValue(mockCourses);

      const result = await service.getRecommendations(userId);

      expect(result).toBeDefined();
      expect(result.topCourses).toEqual(mockCourses);
      expect(result.newestCourses).toEqual(mockCourses);
      expect(result.trendingCourses).toEqual(mockCourses);
      expect(result.roleBasedCourses).toEqual(mockCourses);
      expect(result.skillBasedCourses).toEqual(mockCourses);

      expect(mockProvider.getTopCourses).toHaveBeenCalledWith(userId, 10, []);
      expect(mockProvider.getSkillBasedCourses).toHaveBeenCalledWith(
        [],
        10,
        [],
      );
    });

    it('should return empty arrays if user is not found', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getRecommendations(userId);

      expect(result).toBeDefined();
      expect(result.topCourses).toEqual([]);
      expect(result.newestCourses).toEqual([]);
      expect(result.trendingCourses).toEqual([]);
      expect(result.roleBasedCourses).toEqual([]);
      expect(result.skillBasedCourses).toEqual([]);
    });

    it('should return empty arrays as fallback if provider throws an error', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ _id: userId, roleId }),
      });
      mockProgressModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      mockProvider.getTopCourses.mockRejectedValue(new Error('Database error'));

      const result = await service.getRecommendations(userId);

      expect(result).toBeDefined();
      expect(result.topCourses).toEqual([]);
      expect(result.newestCourses).toEqual([]);
      expect(result.trendingCourses).toEqual([]);
      expect(result.roleBasedCourses).toEqual([]);
      expect(result.skillBasedCourses).toEqual([]);
    });
  });
});
