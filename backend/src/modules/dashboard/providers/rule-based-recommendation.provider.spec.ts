import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RuleBasedRecommendationProvider } from './rule-based-recommendation.provider';
import { Course } from '../../courses/schemas/course.schema';
import { Role, RoleEnum } from '../../roles/schemas/role.schema';
import { Types } from 'mongoose';

const mockCourseModel = {
  find: jest.fn(),
};

const mockRoleModel = {
  findById: jest.fn(),
};

describe('RuleBasedRecommendationProvider', () => {
  let provider: RuleBasedRecommendationProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RuleBasedRecommendationProvider,
        {
          provide: getModelToken(Course.name),
          useValue: mockCourseModel,
        },
        {
          provide: getModelToken(Role.name),
          useValue: mockRoleModel,
        },
      ],
    }).compile();

    provider = module.get<RuleBasedRecommendationProvider>(
      RuleBasedRecommendationProvider,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('getTopCourses', () => {
    it('should return top courses', async () => {
      const mockCourse = {
        _id: new Types.ObjectId(),
        title: 'Course 1',
        category: 'DSA',
        difficultyLevel: 'Beginner',
        rating: 4.5,
        enrollmentCount: 100,
      };

      mockCourseModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockCourse]),
        }),
      });

      const result = await provider.getTopCourses('userId', 10);
      expect(result).toHaveLength(1);
      expect(result[0].title).toEqual('Course 1');
      expect(result[0].recommendationReason).toEqual('Highly rated course');
    });
  });

  describe('getNewestCourses', () => {
    it('should return newest courses', async () => {
      const mockCourse = {
        _id: new Types.ObjectId(),
        title: 'Course 1',
      };

      mockCourseModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockCourse]),
        }),
      });

      const result = await provider.getNewestCourses('userId', 10);
      expect(result).toHaveLength(1);
      expect(result[0].recommendationReason).toEqual('Recently published');
    });
  });

  describe('getTrendingCourses', () => {
    it('should return trending courses', async () => {
      const mockCourse = {
        _id: new Types.ObjectId(),
        title: 'Course 1',
      };

      mockCourseModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockCourse]),
        }),
      });

      const result = await provider.getTrendingCourses('userId', 10);
      expect(result).toHaveLength(1);
      expect(result[0].recommendationReason).toEqual('Popular among students');
    });
  });

  describe('getRoleBasedCourses', () => {
    it('should return empty array if role is not found', async () => {
      mockRoleModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await provider.getRoleBasedCourses(
        new Types.ObjectId().toString(),
        10,
      );
      expect(result).toEqual([]);
    });

    it('should return role based courses for student', async () => {
      mockRoleModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: new Types.ObjectId(),
            name: RoleEnum.STUDENT,
          }),
        }),
      });

      const mockCourse = {
        _id: new Types.ObjectId(),
        title: 'Course 1',
      };

      mockCourseModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockCourse]),
        }),
      });

      const result = await provider.getRoleBasedCourses(
        new Types.ObjectId().toString(),
        10,
      );
      expect(result).toHaveLength(1);
      expect(result[0].recommendationReason).toEqual('Recommended for Student');
    });

    it('should return role based courses for non-student', async () => {
      mockRoleModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: new Types.ObjectId(),
            name: RoleEnum.ADMIN,
          }),
        }),
      });

      const mockCourse = {
        _id: new Types.ObjectId(),
        title: 'Course 1',
      };

      mockCourseModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockCourse]),
        }),
      });

      const result = await provider.getRoleBasedCourses(
        new Types.ObjectId().toString(),
        10,
      );
      expect(result).toHaveLength(1);
      expect(result[0].recommendationReason).toEqual('Recommended for Admin');
    });
  });

  describe('getSkillBasedCourses', () => {
    it('should return empty array if skills are empty', async () => {
      const result = await provider.getSkillBasedCourses([], 10);
      expect(result).toEqual([]);
    });

    it('should return skill based courses', async () => {
      const mockCourse = {
        _id: new Types.ObjectId(),
        title: 'Course 1',
      };

      mockCourseModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockCourse]),
        }),
      });

      const result = await provider.getSkillBasedCourses(['Java'], 10);
      expect(result).toHaveLength(1);
      expect(result[0].recommendationReason).toEqual('Matches your skills');
    });
  });
});
