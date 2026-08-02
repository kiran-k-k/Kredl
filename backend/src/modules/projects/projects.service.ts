import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsFilterDto } from './dto/projects-filter.dto';
import { assertGithubUrl } from '../../common/utils/url-validators';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel('CourseModule')
    private readonly moduleModel: Model<any>,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
    session?: ClientSession,
  ): Promise<Project> {
    // Validate GitHub repository URL format if provided
    if (createProjectDto.repositoryUrl) {
      assertGithubUrl(createProjectDto.repositoryUrl);
    }

    // Verify module exists
    const moduleExists = await this.moduleModel.findById(
      createProjectDto.moduleId,
    );
    if (!moduleExists) {
      throw new NotFoundException(
        `Module with ID ${createProjectDto.moduleId} not found`,
      );
    }

    const project = new this.projectModel({
      ...createProjectDto,
      moduleId: new Types.ObjectId(createProjectDto.moduleId),
      courseId: new Types.ObjectId(createProjectDto.courseId),
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    return project.save({ session });
  }

  async findAll(query: ProjectsFilterDto) {
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
      this.projectModel
        .find(filter)
        .sort({ title: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.projectModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel
      .findOne({ _id: id, isDeleted: { $ne: true } })
      .populate('courseId', 'title slug status')
      .exec();

    if (!project) {
      throw new NotFoundException(`Project #${id} not found`);
    }
    return project;
  }

  async findByModuleId(moduleId: string): Promise<Project[]> {
    return this.projectModel
      .find({
        moduleId: new Types.ObjectId(moduleId),
        isDeleted: { $ne: true },
      })
      .sort({ displayOrder: 1, title: 1 })
      .exec();
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
    session?: ClientSession,
  ): Promise<Project> {
    // Validate GitHub repository URL format if provided
    if (updateProjectDto.repositoryUrl) {
      assertGithubUrl(updateProjectDto.repositoryUrl);
    }

    const updateData: Record<string, any> = {
      ...updateProjectDto,
      updatedBy: new Types.ObjectId(userId),
    };
    if (updateProjectDto.courseId) {
      updateData.courseId = new Types.ObjectId(updateProjectDto.courseId);
    }
    if (updateProjectDto.moduleId) {
      updateData.moduleId = new Types.ObjectId(updateProjectDto.moduleId);
    }

    const project = await this.projectModel
      .findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, updateData, {
        new: true,
        session,
      })
      .exec();

    if (!project) {
      throw new NotFoundException(`Project #${id} not found`);
    }
    return project;
  }

  async remove(
    id: string,
    userId: string,
    session?: ClientSession,
  ): Promise<void> {
    const project = await this.projectModel
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
    if (!project) {
      throw new NotFoundException(`Project #${id} not found`);
    }
  }
}
