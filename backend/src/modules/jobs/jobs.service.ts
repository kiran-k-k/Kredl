import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobStatus } from './schemas/job.schema';
import { JobRole } from '../job-roles/schemas/job-role.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CompaniesService } from '../companies/companies.service';
import slugify from 'slugify';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private readonly jobModel: Model<Job>,
    @InjectModel(JobRole.name)
    private readonly jobRoleModel: Model<JobRole>,
    private readonly companiesService: CompaniesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private generateKeywords(job: Partial<Job>): string[] {
    const text = `${job.title} ${job.jobSummary} ${(job.requiredSkills || []).join(' ')}`;
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
    return [...new Set(words)].filter(w => w.length > 2);
  }

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const company = await this.companiesService.findOne(createJobDto.companyId);
    
    const slugBase = `${createJobDto.title}-${company.name}-${createJobDto.location}`;
    let slug = slugify(slugBase, { lower: true, strict: true });
    
    // Ensure slug uniqueness
    const existing = await this.jobModel.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const searchKeywords = this.generateKeywords(createJobDto as any);

    let publishedAt = undefined;
    if (createJobDto.status === JobStatus.ACTIVE) {
      publishedAt = new Date();
    }

    const job = new this.jobModel({
      ...createJobDto,
      companyId: new Types.ObjectId(createJobDto.companyId),
      roleId: new Types.ObjectId(createJobDto.roleId),
      slug,
      searchKeywords,
      publishedAt,
      companySnapshot: {
        name: company.name,
        logo: company.logo,
        website: company.website,
      }
    });
    const savedJob = await job.save();

    // Auto-sync company to JobRole
    if (savedJob.roleId && savedJob.companyId) {
      await this.jobRoleModel.findByIdAndUpdate(
        savedJob.roleId,
        { $addToSet: { companiesHiring: savedJob.companyId } }
      ).exec().catch(() => {});
    }

    if (savedJob.status === JobStatus.ACTIVE) {
      this.eventEmitter.emit('job.created', {
        jobId: savedJob._id.toString(),
        title: savedJob.title,
        companyName: company.name,
      });
    }

    return savedJob;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    employmentType?: string;
    workMode?: string;
    location?: string;
    companyId?: string;
    roleId?: string;
    experienceRequired?: string;
    isPublic?: boolean;
    status?: JobStatus;
    sort?: string;
  }) {
    const { limit = 10, search, employmentType, workMode, location, companyId, roleId, experienceRequired, isPublic, status, sort } = query;
    const page = Math.max(1, query.page ?? 1);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { isDeleted: false };
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { jobSummary: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { 'companySnapshot.name': { $regex: search, $options: 'i' } }
      ];
    }
    if (employmentType) {
      filter.employmentType = { $in: employmentType.split(',').map(s => s.trim()) };
    }
    if (workMode) {
      filter.workMode = { $in: workMode.split(',').map(s => s.trim()) };
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (companyId && Types.ObjectId.isValid(companyId)) {
      filter.companyId = new Types.ObjectId(companyId);
    }
    if (roleId && Types.ObjectId.isValid(roleId)) {
      filter.roleId = new Types.ObjectId(roleId);
    }
    if (experienceRequired) {
      const expArray = experienceRequired.split(',').map(s => s.trim()).filter(Boolean);
      filter.experienceRequired = { $in: expArray.map(e => new RegExp(e, 'i')) };
    }
    
    if (isPublic) {
      filter.status = JobStatus.ACTIVE;
    } else if (status) {
      filter.status = status;
    }

    let sortOpt: any = { createdAt: -1 };
    
    if (sort) {
      switch (sort) {
        case 'newest':
          sortOpt = { createdAt: -1 };
          break;
        case 'deadline':
          sortOpt = { deadline: 1 };
          break;
        case 'highest_salary':
          sortOpt = { 'salary.max': -1, 'salary.min': -1 };
          break;
        case 'lowest_salary':
          sortOpt = { 'salary.min': 1 };
          break;
        case 'company':
          sortOpt = { 'companySnapshot.name': 1 };
          break;
        case 'experience':
          sortOpt = { experienceRequired: 1 };
          break;
      }
    }

    const [data, total] = await Promise.all([
      this.jobModel
        .find(filter)
        .populate('companyId', 'name logo')
        .populate('roleId', 'title')
        .sort(sortOpt)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.jobModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Job> {
    const filter: any = { isDeleted: false };
    if (Types.ObjectId.isValid(id)) {
      filter.$or = [{ _id: new Types.ObjectId(id) }, { slug: id }];
    } else {
      filter.slug = id;
    }

    const job = await this.jobModel
      .findOne(filter)
      .populate('companyId', 'name logo description')
      .populate('roleId', 'title description')
      .exec();
      
    if (!job) {
      throw new NotFoundException(`Job with ID/Slug #${id} not found`);
    }
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto): Promise<Job> {
    const updateData: Record<string, any> = { ...updateJobDto };
    
    if (updateJobDto.companyId) {
      updateData.companyId = new Types.ObjectId(updateJobDto.companyId);
      const company = await this.companiesService.findOne(updateJobDto.companyId);
      updateData.companySnapshot = {
        name: company.name,
        logo: company.logo,
        website: company.website,
      };
    }
    if (updateJobDto.roleId) {
      updateData.roleId = new Types.ObjectId(updateJobDto.roleId);
    }
    
    // Update search keywords if title, skills or summary changed
    if (updateJobDto.title || updateJobDto.jobSummary || updateJobDto.requiredSkills) {
      const existingJob = await this.jobModel.findById(id).exec();
      if (existingJob) {
        const merged = { ...existingJob.toObject(), ...updateData };
        updateData.searchKeywords = this.generateKeywords(merged);
      }
    }

    // Set publishedAt if status changed to ACTIVE
    if (updateJobDto.status === JobStatus.ACTIVE) {
      const existingJob = await this.jobModel.findById(id).exec();
      if (existingJob && existingJob.status !== JobStatus.ACTIVE && !existingJob.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updatedJob = await this.jobModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .populate('companyId', 'name logo')
      .populate('roleId', 'title')
      .exec();

    if (!updatedJob) {
      throw new NotFoundException(`Job with ID #${id} not found`);
    }

    // Auto-sync company to JobRole if roleId or companyId was updated
    if ((updateJobDto.roleId || updateJobDto.companyId) && updatedJob.roleId && updatedJob.companyId) {
      await this.jobRoleModel.findByIdAndUpdate(
        updatedJob.roleId,
        { $addToSet: { companiesHiring: updatedJob.companyId } }
      ).exec().catch(() => {});
    }

    return updatedJob;
  }

  async remove(id: string, adminId?: string): Promise<void> {
    const result = await this.jobModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date(), deletedBy: adminId || 'system' } },
      { new: true }
    ).exec();
    
    if (!result) {
      throw new NotFoundException(`Job with ID #${id} not found`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredJobs() {
    console.log('Running Cron: handleExpiredJobs');
    const result = await this.jobModel.updateMany(
      {
        status: { $ne: JobStatus.EXPIRED },
        isDeleted: false,
        deadline: { $lt: new Date() },
      },
      {
        $set: { status: JobStatus.EXPIRED }
      }
    );
    console.log(`Cron handleExpiredJobs: Expired ${result.modifiedCount} jobs.`);
  }
}
