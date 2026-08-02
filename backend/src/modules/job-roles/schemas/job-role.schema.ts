import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum JobRoleCategory {
  SOFTWARE_DEVELOPMENT = 'Software Development',
  ARTIFICIAL_INTELLIGENCE = 'Artificial Intelligence',
  DATA_SCIENCE = 'Data Science',
  CLOUD_DEVOPS = 'Cloud & DevOps',
  CYBERSECURITY = 'Cybersecurity',
  EMBEDDED_SYSTEMS = 'Embedded Systems',
  MOBILE_DEVELOPMENT = 'Mobile Development',
  UI_UX_DESIGN = 'UI/UX Design',
  NETWORKING = 'Networking',
  DATABASE_ADMINISTRATION = 'Database Administration',
}

export enum ExperienceLevel {
  FRESHER = 'Fresher',
  ZERO_TO_TWO = '0–2 Years',
  TWO_TO_FIVE = '2–5 Years',
  FIVE_PLUS = '5+ Years',
}

@Schema({ timestamps: true })
export class JobRole extends Document {
  @Prop({ required: true, unique: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, trim: true, index: true })
  slug: string;

  @Prop({ required: true, trim: true })
  shortDescription: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: String,
    enum: JobRoleCategory,
    default: JobRoleCategory.SOFTWARE_DEVELOPMENT,
    index: true,
  })
  category: JobRoleCategory;

  @Prop({
    type: String,
    enum: ExperienceLevel,
    default: ExperienceLevel.FRESHER,
    index: true,
  })
  experienceLevel: ExperienceLevel;

  @Prop({ trim: true })
  estimatedLearningTime?: string; // e.g. "5 Months"

  @Prop({ default: false, index: true })
  isPublished: boolean;

  @Prop({ default: false, index: true })
  isFeatured: boolean;

  @Prop({ default: 0 })
  displayOrder: number;

  @Prop({ type: [String], required: true })
  requiredSkills: string[];

  @Prop({ type: [String], default: [] })
  preferredSkills: string[];

  @Prop({ type: [String], default: [] })
  responsibilities: string[];

  // Structured salary information (replaces plain salaryRange string)
  @Prop({
    type: {
      country: String,
      currency: String,
      fresherRange: String,
      averageSalary: String,
      experiencedRange: String,
    },
    default: null,
  })
  salaryInfo?: {
    country: string;
    currency: string;
    fresherRange: string;
    averageSalary: string;
    experiencedRange: string;
  };

  // Kept for backward compat — prefer salaryInfo
  @Prop()
  salaryRange?: string;

  @Prop({
    type: [
      {
        title: String,
        description: String,
        durationWeeks: Number,
        courseId: { type: Types.ObjectId, ref: 'Course' },
        moduleId: { type: Types.ObjectId, ref: 'CourseModule' },
      },
    ],
    default: [],
  })
  roadmap: Array<{
    title: string;
    description: string;
    durationWeeks: number;
    courseId?: Types.ObjectId;
    moduleId?: Types.ObjectId;
  }>;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Company' }], default: [] })
  companiesHiring: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Project' }], default: [] })
  recommendedProjects: Types.ObjectId[];

  // Grouped interview topics: { "Core Java": ["OOP", "Collections"], "Spring": ["IoC", "DI"] }
  @Prop({ type: Object, default: {} })
  interviewTopics: Record<string, string[]>;

  // Renamed fields to match spec
  @Prop({ type: Object, default: null })
  resumeGuidance?: {
    requiredSections: string[];
    technicalSkills: string[];
    recommendedProjects: string[];
    recommendedCertifications: string[];
    resumeChecklist: string[];
    commonMistakes: string[];
  };
}

export const JobRoleSchema = SchemaFactory.createForClass(JobRole);

// --- Compound Indexes ---
JobRoleSchema.index({ isPublished: 1, category: 1, displayOrder: 1 });
JobRoleSchema.index({ isPublished: 1, isFeatured: 1 });
JobRoleSchema.index({ title: 'text', shortDescription: 'text' });
