import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company } from './schemas/company.schema';
import { Job, JobStatus } from '../jobs/schemas/job.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import slugify from 'slugify';
import {
  AdminActionsLog,
  AdminActionType,
} from '../admin-actions-log/schemas/admin-actions-log.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private readonly companyModel: Model<Company>,
    @InjectModel(AdminActionsLog.name)
    private readonly adminLogModel: Model<AdminActionsLog>,
    @InjectModel(Job.name)
    private readonly jobModel: Model<Job>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async logAdminAction(
    adminId: string | undefined,
    actionType: AdminActionType,
    targetEntityId?: string,
    metadata?: Record<string, any>,
  ) {
    if (!adminId) return;
    try {
      await this.adminLogModel.create({
        adminId: new Types.ObjectId(adminId),
        actionType,
        targetEntity: 'Company',
        targetEntityId: targetEntityId ? new Types.ObjectId(targetEntityId) : undefined,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }

  async create(createCompanyDto: CreateCompanyDto, adminId?: string): Promise<Company> {
    try {
      const slug = slugify(createCompanyDto.name, { lower: true, strict: true });
      const company = new this.companyModel({ ...createCompanyDto, slug });
      const savedCompany = await company.save();
      
      await this.logAdminAction(adminId, AdminActionType.CREATE, savedCompany._id.toString(), { name: savedCompany.name });
      
      this.eventEmitter.emit('company.created', {
        companyId: savedCompany._id.toString(),
        companyName: savedCompany.name,
      });
      
      return savedCompany;
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException(`A company with this name already exists.`);
      }
      throw err;
    }
  }

  async findAll(query: { page?: number; limit?: number; search?: string; activelyHiring?: boolean; topSalary?: boolean; skills?: string; }) {
    const { limit = 10, search, activelyHiring, topSalary, skills } = query;
    const page = Math.max(1, query.page ?? 1);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { overview: { $regex: search, $options: 'i' } }
        ]
      });
    }
    
    if (activelyHiring) {
      const activeJobs = await this.jobModel.find({ status: JobStatus.ACTIVE, isDeleted: false }).select('companyId').lean().exec();
      const activeCompanyIds = [...new Set(activeJobs.map(j => j.companyId.toString()))];
      andConditions.push({ _id: { $in: activeCompanyIds } });
    }
    
    if (topSalary) {
      andConditions.push({ 'salaryRange.max': { $gte: 10 } });
    }
    
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsArray.length > 0) {
        andConditions.push({
          'eligibilityCriteria.requiredSkills': { 
            $regex: new RegExp(skillsArray.join('|'), 'i')
          }
        });
      }
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    const [data, total] = await Promise.all([
      this.companyModel
        .find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.companyModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  async findOne(idOrSlug: string): Promise<Company> {
    const isObjectId = Types.ObjectId.isValid(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
    const company = await this.companyModel.findOne(query).populate('relatedJobRoles').populate('jobOpenings').exec();
    if (!company) {
      throw new NotFoundException(`Company with identifier ${idOrSlug} not found`);
    }
    return company;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    adminId?: string
  ): Promise<Company> {
    const company = await this.companyModel
      .findByIdAndUpdate(id, { $set: updateCompanyDto }, { new: true })
      .exec();
    if (!company) {
      throw new NotFoundException(`Company with ID #${id} not found`);
    }
    
    await this.logAdminAction(adminId, AdminActionType.UPDATE, id, updateCompanyDto);
    
    return company;
  }

  async remove(id: string, adminId?: string): Promise<void> {
    const result = await this.companyModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Company with ID #${id} not found`);
    }
    
    await this.logAdminAction(adminId, AdminActionType.DELETE, id, { name: result.name });
  }
}
