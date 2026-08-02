import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum JobStatus {
  DRAFT = 'Draft',
  ACTIVE = 'Active',
  ARCHIVED = 'Archived',
  EXPIRED = 'Expired',
}

@Schema({ timestamps: true })
export class Job extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobRole', required: true })
  roleId: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  companySnapshot: {
    name: string;
    logo?: string;
    website?: string;
  };

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  location: string;

  @Prop({ type: Object, required: true })
  salary: {
    min: number;
    max: number;
    currency: string;
    period: 'LPA' | 'Monthly' | 'Hourly';
  };

  @Prop({ type: String })
  applyUrl?: string;

  @Prop({ type: Date, required: true })
  deadline: Date;
  
  @Prop({ type: String, required: true })
  jobSummary: string;
  
  @Prop({ type: [String], default: [] })
  requiredSkills: string[];

  @Prop({ required: true })
  experienceRequired: string;

  @Prop({ required: true, enum: ['Internship', 'Full-time', 'Part-time', 'Contract'] })
  employmentType: string;

  @Prop({ required: true, enum: ['Remote', 'Hybrid', 'On-site'] })
  workMode: string;

  @Prop({ type: Object })
  eligibilityCriteria: {
    minimumCgpa: number;
    allowedBranches: string[];
    batchYears: number[];
  };

  @Prop({ type: String, enum: JobStatus, default: JobStatus.DRAFT })
  status: JobStatus;

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ type: Boolean, default: false })
  featured: boolean;

  @Prop({ type: Number, default: 0 })
  bookmarkCount: number;

  @Prop({ type: [String], default: [] })
  searchKeywords: string[];

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: String })
  deletedBy?: string;
}
export const JobSchema = SchemaFactory.createForClass(Job);

// --- Indexing Strategy ---
JobSchema.index({ companyId: 1, roleId: 1 });
JobSchema.index({ status: 1, deadline: 1 });
JobSchema.index({ slug: 1 }, { unique: true });
JobSchema.index({ isDeleted: 1 });
JobSchema.index({ isDeleted: 1, status: 1, companyId: 1, roleId: 1 });
JobSchema.index({ employmentType: 1, location: 1 });
JobSchema.index({ 'salary.min': 1, 'salary.max': -1 });
JobSchema.index({ createdAt: -1 });
JobSchema.index(
  { title: 'text', jobSummary: 'text', location: 'text', searchKeywords: 'text' },
  { weights: { title: 10, searchKeywords: 8, jobSummary: 5, location: 2 } }
);
