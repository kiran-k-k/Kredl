import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  JobRole,
  JobRoleCategory,
  ExperienceLevel,
} from './schemas/job-role.schema';
import { CreateJobRoleDto } from './dto/create-job-role.dto';
import { UpdateJobRoleDto } from './dto/update-job-role.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

@Injectable()
export class JobRolesService {
  constructor(
    @InjectModel(JobRole.name)
    private readonly jobRoleModel: Model<JobRole>,
  ) {}

  private buildObjectIds(ids?: string[]): Types.ObjectId[] {
    return (ids ?? []).map((id) => new Types.ObjectId(id));
  }

  private buildRoadmap(steps?: CreateJobRoleDto['roadmap']) {
    return (steps ?? []).map((step) => ({
      ...step,
      courseId: step.courseId ? new Types.ObjectId(step.courseId) : undefined,
      moduleId: step.moduleId ? new Types.ObjectId(step.moduleId) : undefined,
    }));
  }

  async create(createJobRoleDto: CreateJobRoleDto): Promise<JobRole> {
    // Duplicate title check (case-insensitive)
    const escapedTitle = createJobRoleDto.title
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existing = await this.jobRoleModel
      .findOne({ title: { $regex: `^${escapedTitle}$`, $options: 'i' } })
      .exec();
    if (existing) {
      throw new ConflictException(
        `A job role with the title "${createJobRoleDto.title}" already exists.`,
      );
    }

    // Auto-generate slug from title if not provided
    let slug = createJobRoleDto.slug ?? slugify(createJobRoleDto.title);

    // Ensure slug uniqueness — append counter if needed
    const slugExists = await this.jobRoleModel.findOne({ slug }).exec();
    if (slugExists) {
      const count = await this.jobRoleModel
        .countDocuments({ slug: { $regex: `^${slug}(-\\d+)?$` } })
        .exec();
      slug = `${slug}-${count + 1}`;
    }

    try {
      const jobRole = new this.jobRoleModel({
        ...createJobRoleDto,
        slug,
        companiesHiring: this.buildObjectIds(createJobRoleDto.companiesHiring),
        recommendedProjects: this.buildObjectIds(
          createJobRoleDto.recommendedProjects,
        ),
        roadmap: this.buildRoadmap(createJobRoleDto.roadmap),
      });
      return await jobRole.save();
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException(
          `A job role with this title or slug already exists.`,
        );
      }
      throw err;
    }
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    experienceLevel?: string;
    isFeatured?: boolean;
    sortBy?: string;
    adminMode?: boolean;
  }) {
    const { limit = 10, search, sortBy, adminMode = false } = query;
    const page = Math.max(1, query.page ?? 1);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    // Public consumers only see published roles
    if (!adminMode) {
      filter.isPublished = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.experienceLevel) {
      filter.experienceLevel = query.experienceLevel;
    }

    if (query.isFeatured !== undefined) {
      filter.isFeatured = query.isFeatured;
    }

    let sortOpts: Record<string, any> = { displayOrder: 1, title: 1 };
    if (sortBy === 'newest') sortOpts = { createdAt: -1 };
    else if (sortBy === 'alphabetical') sortOpts = { title: 1 };

    const [data, total] = await Promise.all([
      this.jobRoleModel
        .find(filter)
        // Lean projection for list — avoid heavy population
        .select(
          'title slug shortDescription category experienceLevel estimatedLearningTime salaryInfo salaryRange isPublished isFeatured displayOrder requiredSkills companiesHiring recommendedProjects roadmap createdAt',
        )
        .populate('companiesHiring', 'name logo slug')
        .populate('recommendedProjects', 'title difficulty')
        .sort(sortOpts)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.jobRoleModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  async findFeatured(): Promise<JobRole[]> {
    return this.jobRoleModel
      .find({ isPublished: true, isFeatured: true })
      .select(
        'title slug shortDescription category experienceLevel salaryInfo salaryRange requiredSkills companiesHiring',
      )
      .populate('companiesHiring', 'name logo')
      .sort({ displayOrder: 1 })
      .limit(6)
      .lean()
      .exec() as unknown as JobRole[];
  }

  async findBySlug(slugOrId: string): Promise<JobRole> {
    let jobRole = await this.jobRoleModel
      .findOne({ slug: slugOrId })
      .populate('companiesHiring', 'name logo slug eligibilityCriteria salaryRange')
      .populate(
        'recommendedProjects',
        'title shortDescription difficulty technologies learningObjectives repositoryUrl',
      )
      .populate('roadmap.courseId', 'title slug')
      .populate('roadmap.moduleId', 'title slug')
      .exec();

    // Backward compat — fall back to ID lookup if slug not found
    if (!jobRole && Types.ObjectId.isValid(slugOrId)) {
      jobRole = await this.jobRoleModel
        .findById(slugOrId)
        .populate('companiesHiring', 'name logo slug eligibilityCriteria salaryRange')
        .populate(
          'recommendedProjects',
          'title shortDescription difficulty technologies learningObjectives repositoryUrl',
        )
        .populate('roadmap.courseId', 'title slug')
        .populate('roadmap.moduleId', 'title slug')
        .exec();
    }

    if (!jobRole) {
      throw new NotFoundException(`Job role "${slugOrId}" not found.`);
    }
    return jobRole;
  }

  async findOne(id: string): Promise<JobRole> {
    const jobRole = await this.jobRoleModel
      .findById(id)
      .populate('companiesHiring', 'name logo slug eligibilityCriteria salaryRange')
      .populate(
        'recommendedProjects',
        'title shortDescription difficulty technologies learningObjectives repositoryUrl',
      )
      .populate('roadmap.courseId', 'title slug')
      .populate('roadmap.moduleId', 'title slug')
      .exec();
    if (!jobRole) {
      throw new NotFoundException(`Job Role with ID #${id} not found`);
    }
    return jobRole;
  }

  async getRelated(slug: string, limit = 3): Promise<JobRole[]> {
    const role = await this.jobRoleModel
      .findOne({ slug })
      .select('category _id')
      .lean()
      .exec();
    if (!role) return [];

    return this.jobRoleModel
      .find({
        isPublished: true,
        category: role.category,
        _id: { $ne: role._id },
      })
      .select('title slug shortDescription category experienceLevel salaryInfo salaryRange requiredSkills')
      .sort({ displayOrder: 1 })
      .limit(limit)
      .lean()
      .exec() as unknown as JobRole[];
  }

  async update(id: string, updateJobRoleDto: UpdateJobRoleDto): Promise<JobRole> {
    const updateData: Record<string, any> = { ...updateJobRoleDto };

    // Regenerate slug if title changed
    if (updateJobRoleDto.title) {
      const newSlug =
        updateJobRoleDto.slug ?? slugify(updateJobRoleDto.title);
      const conflict = await this.jobRoleModel
        .findOne({ slug: newSlug, _id: { $ne: id } })
        .exec();
      if (conflict) {
        const count = await this.jobRoleModel
          .countDocuments({ slug: { $regex: `^${newSlug}(-\\d+)?$` }, _id: { $ne: id } })
          .exec();
        updateData.slug = `${newSlug}-${count + 1}`;
      } else {
        updateData.slug = newSlug;
      }
    }

    if (updateJobRoleDto.companiesHiring) {
      updateData.companiesHiring = this.buildObjectIds(
        updateJobRoleDto.companiesHiring,
      );
    }
    if (updateJobRoleDto.recommendedProjects) {
      updateData.recommendedProjects = this.buildObjectIds(
        updateJobRoleDto.recommendedProjects,
      );
    }
    if (updateJobRoleDto.roadmap) {
      updateData.roadmap = this.buildRoadmap(updateJobRoleDto.roadmap);
    }

    const jobRole = await this.jobRoleModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate('companiesHiring', 'name logo slug eligibilityCriteria salaryRange')
      .populate(
        'recommendedProjects',
        'title shortDescription difficulty technologies learningObjectives repositoryUrl',
      )
      .populate('roadmap.courseId', 'title slug')
      .populate('roadmap.moduleId', 'title slug')
      .exec();

    if (!jobRole) {
      throw new NotFoundException(`Job Role with ID #${id} not found`);
    }
    return jobRole;
  }

  async publish(id: string): Promise<JobRole> {
    const jobRole = await this.jobRoleModel
      .findByIdAndUpdate(id, { $set: { isPublished: true } }, { new: true })
      .exec();
    if (!jobRole) throw new NotFoundException(`Job Role with ID #${id} not found`);
    return jobRole;
  }

  async unpublish(id: string): Promise<JobRole> {
    const jobRole = await this.jobRoleModel
      .findByIdAndUpdate(id, { $set: { isPublished: false } }, { new: true })
      .exec();
    if (!jobRole) throw new NotFoundException(`Job Role with ID #${id} not found`);
    return jobRole;
  }

  async remove(id: string): Promise<void> {
    const result = await this.jobRoleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Job Role with ID #${id} not found`);
    }
  }
}
