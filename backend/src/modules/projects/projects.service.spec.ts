/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProjectsService } from './projects.service';
import { Project } from './schemas/project.schema';
import { CourseModule } from '../modules/schemas/module.schema';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const fakeId = new Types.ObjectId().toHexString();
const courseId = new Types.ObjectId().toHexString();
const userId = new Types.ObjectId().toHexString();

const VALID_GH_URL = 'https://github.com/owner/repo';
const INVALID_GH_URL = 'https://gitlab.com/owner/repo';

function buildProject(overrides: Partial<any> = {}): any {
  return {
    _id: new Types.ObjectId(),
    title: 'My Project',
    courseId: new Types.ObjectId(courseId),
    isDeleted: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------
function mockProjectModel() {
  const save = jest.fn().mockResolvedValue(buildProject());
  const instance = { save };
  const Model: any = jest.fn().mockImplementation(() => instance);

  Model.findOne = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(buildProject()),
  });
  Model.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([buildProject()]),
  });
  Model.findOneAndUpdate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(buildProject()),
  });
  Model.countDocuments = jest.fn().mockResolvedValue(1);

  return Model;
}

function mockCourseModuleModel() {
  const Model: any = jest.fn().mockImplementation(() => ({}));
  Model.countDocuments = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
  Model.exists = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
  Model.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(), title: 'Module' }) });
  return Model;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectModel: ReturnType<typeof mockProjectModel>;
  let courseModuleModel: ReturnType<typeof mockCourseModuleModel>;

  beforeEach(async () => {
    projectModel = mockProjectModel();
    courseModuleModel = mockCourseModuleModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getModelToken(Project.name), useValue: projectModel },
        { provide: getModelToken(CourseModule.name), useValue: courseModuleModel },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  // -------------------------------------------------------------------------
  // create()
  // -------------------------------------------------------------------------
  describe('create()', () => {
    const baseDto = {
      title: 'My Project',
      description: 'desc',
      courseId,
      technologies: ['TypeScript'],
      difficulty: 'Beginner',
    } as any;

    it('throws BadRequestException for invalid GitHub URL', async () => {
      await expect(
        service.create({ ...baseDto, repositoryUrl: INVALID_GH_URL }, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('saves successfully with a valid GitHub URL', async () => {
      const result = await service.create(
        { ...baseDto, repositoryUrl: VALID_GH_URL },
        userId,
      );
      expect(result).toBeDefined();
    });

    it('saves successfully without a repositoryUrl (optional field)', async () => {
      const result = await service.create(baseDto, userId);
      expect(result).toBeDefined();
    });

    it('error message includes the bad URL', async () => {
      await expect(
        service.create({ ...baseDto, repositoryUrl: INVALID_GH_URL }, userId),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(INVALID_GH_URL),
        }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // findAll()
  // -------------------------------------------------------------------------
  describe('findAll()', () => {
    it('returns paginated data', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
    });

    it('filters by courseId when provided', async () => {
      await service.findAll({ page: 1, limit: 10, courseId });
      expect(projectModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ courseId: expect.any(Types.ObjectId) }),
      );
    });

    it('adds title search filter when search is provided', async () => {
      await service.findAll({
        page: 1,
        limit: 10,
        search: 'calculator',
      });
      expect(projectModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          title: { $regex: 'calculator', $options: 'i' },
        }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // findOne()
  // -------------------------------------------------------------------------
  describe('findOne()', () => {
    it('returns a project when found', async () => {
      const result = await service.findOne(fakeId);
      expect(result).toBeDefined();
    });

    it('throws NotFoundException when project not found', async () => {
      projectModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.findOne(fakeId)).rejects.toThrow(NotFoundException);
    });
  });

  // -------------------------------------------------------------------------
  // update()
  // -------------------------------------------------------------------------
  describe('update()', () => {
    it('throws BadRequestException for invalid GitHub URL', async () => {
      await expect(
        service.update(
          fakeId,
          { repositoryUrl: INVALID_GH_URL } as any,
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('updates successfully with valid data and processes courseId', async () => {
      const newCourseId = new Types.ObjectId().toString();
      const result = await service.update(
        fakeId,
        { repositoryUrl: VALID_GH_URL, courseId: newCourseId },
        userId,
      );
      expect(result).toBeDefined();
      expect(projectModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ courseId: new Types.ObjectId(newCourseId) }),
        expect.any(Object),
      );
    });

    it('throws NotFoundException when project not found', async () => {
      projectModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(
        service.update(fakeId, { title: 'New' } as any, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // -------------------------------------------------------------------------
  // remove()
  // -------------------------------------------------------------------------
  describe('remove()', () => {
    it('soft-deletes successfully', async () => {
      await expect(service.remove(fakeId, userId)).resolves.toBeUndefined();
    });

    it('throws NotFoundException when project not found', async () => {
      projectModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.remove(fakeId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
