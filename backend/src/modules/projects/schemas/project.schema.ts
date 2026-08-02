import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ProjectStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({
    type: Types.ObjectId,
    ref: 'CourseModule',
    required: true,
    index: true,
  })
  moduleId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true,
  })
  courseId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 100 })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop()
  detailedDescription?: string;

  @Prop({
    match: [/^https:\/\/github\.com\/.+$/, 'Must be a valid GitHub URL'],
  })
  repositoryUrl?: string;

  @Prop({ type: [String], required: true, default: [] })
  technologies: string[];

  @Prop({
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  })
  difficulty: string;

  @Prop({ type: [String], default: [] })
  learningObjectives: string[];

  @Prop({ required: true, min: 1, default: 60 })
  estimatedDurationMinutes: number;

  @Prop({ required: true, default: 0 })
  displayOrder: number;

  @Prop()
  suggestedImprovements?: string;

  // --- Content Status Lifecycle & Soft Delete ---
  @Prop({
    type: String,
    enum: ProjectStatus,
    default: ProjectStatus.DRAFT,
  })
  status: ProjectStatus;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
