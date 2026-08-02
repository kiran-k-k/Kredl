import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    updateOnboarding: jest.fn(),
    findById: jest.fn(),
    updateProfile: jest.fn(),
    getCareerProfile: jest.fn(),
    updateCareerProfile: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateOnboarding', () => {
    it('should call usersService.updateOnboarding', async () => {
      const dto = { courseId: 'course123' };
      mockUsersService.updateOnboarding.mockResolvedValue({ _id: 'user1' });

      const result = await controller.updateOnboarding(dto, { sub: 'user1' });
      
      expect(mockUsersService.updateOnboarding).toHaveBeenCalledWith('user1', dto);
      expect(result).toEqual({ _id: 'user1' });
    });
  });

  describe('getMe', () => {
    it('should return user profile without passwordHash', async () => {
      const mockUser = {
        _id: 'user1',
        email: 'test@example.com',
        passwordHash: 'hashed123',
        toObject: function() { return { ...this }; }
      };
      
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getMe({ sub: 'user1' });
      
      expect(mockUsersService.findById).toHaveBeenCalledWith('user1');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(controller.getMe({ sub: 'missing' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMe', () => {
    it('should update user and return profile without passwordHash', async () => {
      const updateDto = { firstName: 'Updated' };
      const mockUser = {
        _id: 'user1',
        firstName: 'Updated',
        passwordHash: 'hashed123',
        toObject: function() { return { ...this }; }
      };
      
      mockUsersService.updateProfile.mockResolvedValue(mockUser);

      const result = await controller.updateMe({ sub: 'user1' }, updateDto);
      
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith('user1', updateDto);
      expect(result).toHaveProperty('firstName', 'Updated');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw NotFoundException if update fails to find user', async () => {
      mockUsersService.updateProfile.mockResolvedValue(null);

      await expect(controller.updateMe({ sub: 'missing' }, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('career-profile', () => {
    it('should get career profile', async () => {
      mockUsersService.getCareerProfile.mockResolvedValue({ skills: ['Jest'] });
      const result = await controller.getCareerProfile({ sub: 'user1' });
      expect(result).toEqual({ skills: ['Jest'] });
    });

    it('should update career profile', async () => {
      const updateDto = { skills: ['NestJS'] };
      mockUsersService.updateCareerProfile.mockResolvedValue(updateDto);
      
      const result = await controller.updateCareerProfile({ sub: 'user1' }, updateDto);
      expect(mockUsersService.updateCareerProfile).toHaveBeenCalledWith('user1', updateDto);
      expect(result).toEqual(updateDto);
    });
  });
});
