import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { CareerProfile } from './schemas/career-profile.schema';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { createQueryMock } from '../../common/utils/test-helpers';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModel = {
    new: jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ _id: '123', ...dto }),
    })),
    constructor: jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ _id: '123', ...dto }),
    })),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateOne: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
  };

  const mockCareerProfileModel = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // We mock the constructor behavior for 'new this.userModel'
    mockUserModel.constructor.mockClear();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(CareerProfile.name),
          useValue: mockCareerProfileModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      // Need a proper mock for class instantiation
      const userData = { email: 'test@example.com' };
      
      // Override the service's model to a mock class that we can track
      class MockUserModelClass {
        constructor(public data: any) {}
        save() {
          return Promise.resolve({ _id: '123', ...this.data });
        }
      }
      
      (service as any).userModel = MockUserModelClass;

      const result = await service.create(userData);
      expect(result).toEqual({ _id: '123', ...userData });
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const mockUser = { _id: '123', email: 'test@test.com' };
      mockUserModel.findOne.mockReturnValue(createQueryMock(mockUser));
      
      const result = await service.findByEmail('test@test.com');
      
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
      expect(result).toEqual(mockUser);
    });
    
    it('should return null if user not found', async () => {
      mockUserModel.findOne.mockReturnValue(createQueryMock(null));
      const result = await service.findByEmail('missing@test.com');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const mockUser = { _id: '123' };
      mockUserModel.findById.mockReturnValue(createQueryMock(mockUser));
      
      const result = await service.findById('123');
      
      expect(mockUserModel.findById).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('getDashboardProfile', () => {
    it('should return a transformed profile if user exists', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        profileImage: 'avatar.png',
        department: 'Engineering',
        createdAt: new Date('2023-01-01'),
        roleId: { name: 'STUDENT' },
        collegeId: { name: 'Test College' },
      };
      
      mockUserModel.findById.mockReturnValue(createQueryMock(mockUser));
      
      const result = await service.getDashboardProfile(mockUser._id.toString());
      
      expect(result).toEqual({
        id: mockUser._id.toString(),
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'avatar.png',
        role: 'STUDENT',
        college: 'Test College',
        department: 'Engineering',
        joinedAt: mockUser.createdAt,
      });
    });

    it('should return null if user does not exist', async () => {
      mockUserModel.findById.mockReturnValue(createQueryMock(null));
      const result = await service.getDashboardProfile(new Types.ObjectId().toString());
      expect(result).toBeNull();
    });
  });

  describe('findAllAdmin', () => {
    it('should return paginated users without role filter', async () => {
      const mockUsers = [{ _id: '1', roleId: { name: 'STUDENT' } }];
      mockUserModel.find.mockReturnValue(createQueryMock(mockUsers));
      mockUserModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAllAdmin(1, 10, 'John', undefined, 'ACTIVE');

      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      
      // Check that regex query was formed
      expect(mockUserModel.find).toHaveBeenCalledWith(expect.objectContaining({
        $or: expect.any(Array),
        status: 'ACTIVE',
        deletedAt: { $exists: false }
      }));
    });
    
    it('should filter by role if provided', async () => {
      const mockUsers = [
        { _id: '1', roleId: { name: 'STUDENT' } },
        { _id: '2', roleId: { name: 'ADMIN' } }
      ];
      mockUserModel.find.mockReturnValue(createQueryMock(mockUsers));
      mockUserModel.countDocuments.mockResolvedValue(2);

      const result = await service.findAllAdmin(1, 10, undefined, 'STUDENT', undefined);

      // Only STUDENT should be returned
      expect(result.users.length).toBe(1);
      expect(result.users[0]._id).toBe('1');
    });
  });

  describe('updateProfile', () => {
    it('should update and return user', async () => {
      const mockUser = { _id: '123', firstName: 'Updated' };
      mockUserModel.findByIdAndUpdate.mockReturnValue(createQueryMock(mockUser));

      const result = await service.updateProfile('123', { firstName: 'Updated' });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue(createQueryMock(null));

      await expect(service.updateProfile('123', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCareerProfile', () => {
    it('should update career profile and mark user profile as completed', async () => {
      const mockProfile = { userId: '123', skills: ['Jest'] };
      mockCareerProfileModel.findOneAndUpdate.mockReturnValue(createQueryMock(mockProfile));
      mockUserModel.findByIdAndUpdate.mockReturnValue(createQueryMock({ _id: '123' }));

      const result = await service.updateCareerProfile('123', { skills: ['Jest'] });
      
      expect(result).toEqual(mockProfile);
      expect(mockCareerProfileModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: '123' },
        { $set: { skills: ['Jest'] } },
        { new: true, upsert: true }
      );
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '123', 
        { profileCompleted: true }
      );
    });
  });
});
