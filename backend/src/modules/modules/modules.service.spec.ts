/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CourseModulesService } from './modules.service';
import { CourseModule } from './schemas/module.schema';
import { SlugService } from '../../common/services/slug.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

const fakeId = new Types.ObjectId().toHexString();
const courseId = new Types.ObjectId().toHexString();
const userId = new Types.ObjectId().toHexString();

function buildModule(overrides: Partial<any> = {}): any {
  return {
    _id: new Types.ObjectId(),
    title: 'Module 1',
    slug: 'module-1',
    order: 1,
    courseId: new Types.ObjectId(courseId),
    isDeleted: false,
    ...overrides,
  };
}

function mockModuleModel() {
  const save = jest.fn().mockResolvedValue(buildModule());
  const instance = { save };
  const Model: any = jest.fn().mockImplementation(() => instance);

  const mockFindOneQuery = {
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(null),
    then: jest
      .fn()
      .mockImplementation((onfulfilled) =>
        Promise.resolve(null).then(onfulfilled),
      ),
  };
  Model.findOne = jest.fn().mockReturnValue(mockFindOneQuery);

  Model.find = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([buildModule()]),
  });

  Model.findOneAndUpdate = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(buildModule()),
  });

  Model.countDocuments = jest.fn().mockResolvedValue(1);
  Model.exists = jest.fn().mockResolvedValue(null);

  return Model;
}

function mockSlugService(): jest.Mocked<SlugService> {
  return {
    generate: jest.fn().mockReturnValue('module-1'),
    generateUnique: jest.fn().mockResolvedValue('module-1'),
  } as any;
}

describe('CourseModulesService', () => {
  let service: CourseModulesService;
  let moduleModel: any;
  let slugService: jest.Mocked<SlugService>;

  beforeEach(async () => {
    moduleModel = mockModuleModel();
    slugService = mockSlugService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseModulesService,
        { provide: getModelToken(CourseModule.name), useValue: moduleModel },
        { provide: SlugService, useValue: slugService },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<CourseModulesService>(CourseModulesService);
  });

  describe('create()', () => {
    const dto = { title: 'Module 1', courseId, order: 1 } as any;

    it('throws BadRequestException when order already exists in the course', async () => {
      moduleModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(buildModule()),
        then: jest
          .fn()
          .mockImplementation((onfulfilled) =>
            Promise.resolve(buildModule()).then(onfulfilled),
          ),
      });

      await expect(service.create(dto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('saves successfully when no order conflict', async () => {
      const result = await service.create(dto, userId);
      expect(result).toBeDefined();
    });

    it('calls SlugService.generateUnique with the module title', async () => {
      await service.create(dto, userId);
      expect(slugService.generateUnique).toHaveBeenCalledWith(
        'Module 1',
        expect.any(Function),
      );
    });

    it('tests the exists check callback passed to SlugService.generateUnique', async () => {
      let callback: (candidate: string) => Promise<boolean>;
      slugService.generateUnique.mockImplementationOnce((title, cb) => {
        callback = cb;
        return Promise.resolve('module-1');
      });

      await service.create(dto, userId);

      moduleModel.exists.mockResolvedValueOnce({ _id: new Types.ObjectId() });
      const exists = await callback!('module-1');
      expect(exists).toBe(true);
      expect(moduleModel.exists).toHaveBeenCalledWith({
        courseId: new Types.ObjectId(courseId),
        slug: 'module-1',
      });
    });
  });

  describe('findAll()', () => {
    it('returns paginated data', async () => {
      moduleModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([buildModule()]),
      });
      moduleModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
    });

    it('filters by courseId when provided', async () => {
      moduleModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([buildModule()]),
      });

      await service.findAll({ page: 1, limit: 10, courseId });
      expect(moduleModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ courseId: expect.any(Types.ObjectId) }),
      );
    });

    it('filters by search term when provided', async () => {
      moduleModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([buildModule()]),
      });

      await service.findAll({ page: 1, limit: 10, search: 'module' });
      expect(moduleModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ title: { $regex: 'module', $options: 'i' } }),
      );
    });
  });

  describe('findOne()', () => {
    it('returns a module when found', async () => {
      moduleModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(buildModule()),
      });

      const result = await service.findOne(fakeId);
      expect(result).toBeDefined();
    });

    it('throws NotFoundException when module not found', async () => {
      moduleModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(fakeId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('throws NotFoundException when module not found during order check', async () => {
      // findOne returns null for existing module check
      moduleModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
        then: jest
          .fn()
          .mockImplementation((onfulfilled) =>
            Promise.resolve(null).then(onfulfilled),
          ),
      });

      await expect(
        service.update(fakeId, { order: 2 } as any, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when new order conflicts with another module', async () => {
      // First call fetches existing module
      moduleModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(buildModule()),
        then: jest
          .fn()
          .mockImplementation((onfulfilled) =>
            Promise.resolve(buildModule()).then(onfulfilled),
          ),
      });
      // Second call checks for order conflict and finds one
      moduleModel.findOne.mockReturnValueOnce({
        exec: jest
          .fn()
          .mockResolvedValue(buildModule({ _id: new Types.ObjectId() })),
        then: jest
          .fn()
          .mockImplementation((onfulfilled) =>
            Promise.resolve(buildModule({ _id: new Types.ObjectId() })).then(
              onfulfilled,
            ),
          ),
      });

      await expect(
        service.update(fakeId, { order: 2 } as any, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('updates successfully when no order conflict and processes courseId', async () => {
      moduleModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(buildModule()),
        then: jest
          .fn()
          .mockImplementation((onfulfilled) =>
            Promise.resolve(buildModule()).then(onfulfilled),
          ),
      });
      moduleModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
        then: jest
          .fn()
          .mockImplementation((onfulfilled) =>
            Promise.resolve(null).then(onfulfilled),
          ),
      });
      moduleModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(buildModule()),
        then: jest
          .fn()
          .mockImplementation((onfulfilled) =>
            Promise.resolve(buildModule()).then(onfulfilled),
          ),
      });

      const newCourseId = new Types.ObjectId().toString();
      const result = await service.update(
        fakeId,
        { order: 2, courseId: newCourseId },
        userId,
      );
      expect(result).toBeDefined();
      expect(moduleModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ courseId: new Types.ObjectId(newCourseId) }),
        expect.any(Object),
      );
    });

    it('throws NotFoundException when findOneAndUpdate returns null', async () => {
      moduleModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(buildModule()),
        then: jest
          .fn()
          .mockImplementation((onfulfilled) =>
            Promise.resolve(buildModule()).then(onfulfilled),
          ),
      });
      moduleModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
        then: jest
          .fn()
          .mockImplementation((onfulfilled) =>
            Promise.resolve(null).then(onfulfilled),
          ),
      });

      await expect(
        service.update(fakeId, { title: 'New' } as any, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('soft-deletes successfully', async () => {
      moduleModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(buildModule()),
        then: jest
          .fn()
          .mockImplementation((onfulfilled) =>
            Promise.resolve(buildModule()).then(onfulfilled),
          ),
      });

      await expect(service.remove(fakeId, userId)).resolves.toBeUndefined();
    });

    it('throws NotFoundException when module not found', async () => {
      moduleModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
        then: jest
          .fn()
          .mockImplementation((onfulfilled) =>
            Promise.resolve(null).then(onfulfilled),
          ),
      });

      await expect(service.remove(fakeId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
