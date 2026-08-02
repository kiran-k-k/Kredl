import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RolesService } from './roles.service';
import { Role, RoleEnum } from './schemas/role.schema';
import { Logger } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;

  const mockRoleModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Silence logger during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getModelToken(Role.name),
          useValue: mockRoleModel,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize default roles if they do not exist', async () => {
      // Mock findOne to return null for all roles (simulating empty DB)
      const mockQuery = { exec: jest.fn().mockResolvedValue(null) };
      mockRoleModel.findOne.mockReturnValue(mockQuery);
      mockRoleModel.create.mockResolvedValue({});

      await service.onModuleInit();

      // Should check 3 roles (STUDENT, TPO, ADMIN)
      expect(mockRoleModel.findOne).toHaveBeenCalledTimes(3);
      expect(mockRoleModel.create).toHaveBeenCalledTimes(3);
      
      expect(mockRoleModel.findOne).toHaveBeenCalledWith({ name: RoleEnum.STUDENT });
      expect(mockRoleModel.findOne).toHaveBeenCalledWith({ name: RoleEnum.TPO });
      expect(mockRoleModel.findOne).toHaveBeenCalledWith({ name: RoleEnum.ADMIN });
    });

    it('should skip creation if roles already exist', async () => {
      // Mock findOne to return an existing role
      const mockQuery = { exec: jest.fn().mockResolvedValue({ _id: '123' }) };
      mockRoleModel.findOne.mockReturnValue(mockQuery);

      await service.onModuleInit();

      expect(mockRoleModel.findOne).toHaveBeenCalledTimes(3);
      // Should not call create
      expect(mockRoleModel.create).not.toHaveBeenCalled();
    });
  });

  describe('findByName', () => {
    it('should return a role by name', async () => {
      const mockRole = { _id: '123', name: RoleEnum.STUDENT };
      const mockQuery = { exec: jest.fn().mockResolvedValue(mockRole) };
      mockRoleModel.findOne.mockReturnValue(mockQuery);

      const result = await service.findByName(RoleEnum.STUDENT);

      expect(mockRoleModel.findOne).toHaveBeenCalledWith({ name: RoleEnum.STUDENT });
      expect(result).toEqual(mockRole);
    });

    it('should return null if role not found by name', async () => {
      const mockQuery = { exec: jest.fn().mockResolvedValue(null) };
      mockRoleModel.findOne.mockReturnValue(mockQuery);

      const result = await service.findByName(RoleEnum.ADMIN);

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a role by id', async () => {
      const mockRole = { _id: '123', name: RoleEnum.TPO };
      const mockQuery = { exec: jest.fn().mockResolvedValue(mockRole) };
      mockRoleModel.findById.mockReturnValue(mockQuery);

      const result = await service.findById('123');

      expect(mockRoleModel.findById).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockRole);
    });

    it('should return null if role not found by id', async () => {
      const mockQuery = { exec: jest.fn().mockResolvedValue(null) };
      mockRoleModel.findById.mockReturnValue(mockQuery);

      const result = await service.findById('missing');

      expect(result).toBeNull();
    });
  });
});
