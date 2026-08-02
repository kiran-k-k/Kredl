import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { CourseModule, CourseModuleDocument } from './schemas/module.schema';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModulesFilterDto } from './dto/modules-filter.dto';
import { SlugService } from '../../common/services/slug.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ModuleStatus } from './schemas/module.schema';

@Injectable()
export class CourseModulesService {
  constructor(
    @InjectModel(CourseModule.name)
    private readonly moduleModel: Model<CourseModuleDocument>,
    private readonly slugService: SlugService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    createModuleDto: CreateModuleDto,
    userId: string,
    session?: ClientSession,
  ): Promise<CourseModule> {
    const courseObjectId = new Types.ObjectId(createModuleDto.courseId);

    // Pre-flight: prevent duplicate order within a course
    const orderConflict = await this.moduleModel.findOne({
      courseId: courseObjectId,
      order: createModuleDto.order,
      isDeleted: { $ne: true },
    });
    if (orderConflict) {
      throw new BadRequestException(
        `A module with order ${createModuleDto.order} already exists in this course.`,
      );
    }

    // Auto-generate unique slug from title
    const slug = await this.slugService.generateUnique(
      createModuleDto.title,
      async (candidate) =>
        !!(await this.moduleModel.exists({
          courseId: courseObjectId,
          slug: candidate,
        })),
    );

    const courseModule = new this.moduleModel({
      ...createModuleDto,
      courseId: courseObjectId,
      slug,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    return courseModule.save({ session });
  }

  async findAll(query: ModulesFilterDto) {
    const { page = 1, limit = 10, search, courseId } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { isDeleted: { $ne: true } };
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (courseId) {
      filter.courseId = new Types.ObjectId(courseId);
    }

    const [data, total] = await Promise.all([
      this.moduleModel
        .find(filter)
        .populate('courseId', 'title')
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.moduleModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<CourseModule> {
    const courseModule = await this.moduleModel
      .findOne({ _id: id, isDeleted: { $ne: true } })
      .populate('courseId', 'title slug status')
      .exec();

    if (!courseModule) {
      throw new NotFoundException(`Module #${id} not found`);
    }
    return courseModule;
  }

  async update(
    id: string,
    updateModuleDto: UpdateModuleDto,
    userId: string,
    session?: ClientSession,
  ): Promise<CourseModule> {
    const existing = await this.moduleModel
      .findOne({ _id: id, isDeleted: { $ne: true } })
      .exec();
    if (!existing) {
      throw new NotFoundException(`Module #${id} not found`);
    }

    // Pre-flight: prevent duplicate order within a course (excluding self)
    if (updateModuleDto.order !== undefined) {
      const courseId = updateModuleDto.courseId
        ? new Types.ObjectId(updateModuleDto.courseId)
        : existing.courseId;
      const orderConflict = await this.moduleModel.findOne({
        courseId,
        order: updateModuleDto.order,
        isDeleted: { $ne: true },
        _id: { $ne: id },
      });
      if (orderConflict) {
        throw new BadRequestException(
          `A module with order ${updateModuleDto.order} already exists in this course.`,
        );
      }
    }

    const updateData: Record<string, any> = {
      ...updateModuleDto,
      updatedBy: new Types.ObjectId(userId),
    };
    if (updateModuleDto.courseId) {
      updateData.courseId = new Types.ObjectId(updateModuleDto.courseId);
    }

    const courseModule = await this.moduleModel
      .findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, updateData, {
        new: true,
        session,
      })
      .exec();

    if (!courseModule) {
      throw new NotFoundException(`Module #${id} not found`);
    }

    if (existing.status !== ModuleStatus.PUBLISHED && courseModule.status === ModuleStatus.PUBLISHED) {
      this.eventEmitter.emit('module.published', {
        moduleId: courseModule._id.toString(),
        moduleTitle: courseModule.title,
        courseId: courseModule.courseId.toString(),
      });
    }

    return courseModule;
  }

  async remove(
    id: string,
    userId: string,
    session?: ClientSession,
  ): Promise<void> {
    const courseModule = await this.moduleModel
      .findOneAndUpdate(
        { _id: id, isDeleted: { $ne: true } },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: new Types.ObjectId(userId),
        },
        { new: true, session },
      )
      .exec();
    if (!courseModule) {
      throw new NotFoundException(`Module #${id} not found`);
    }
  }
}
