import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ModuleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export type CourseModuleDocument = CourseModule & Document;

@Schema({ timestamps: true })
export class CourseModule {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 100 })
  title: string;

  @Prop({ required: true, trim: true })
  slug: string;

  @Prop({ maxlength: 500 })
  description?: string;

  @Prop({ required: true, min: 0 })
  order: number;

  // --- Prerequisite System ---
  @Prop({ type: [{ type: Types.ObjectId, ref: 'CourseModule' }], default: [] })
  prerequisites: Types.ObjectId[];

  // --- Structured Unlock Criteria ---
  @Prop({
    type: {
      requirePreviousModule: { type: Boolean, default: false },
      minimumQuizScore: { type: Number, default: 0 },
      requiredLessonsCompleted: { type: Number, default: 0 },
    },
    default: {
      requirePreviousModule: false,
      minimumQuizScore: 0,
      requiredLessonsCompleted: 0,
    },
  })
  unlockCriteria: Record<string, any>;

  @Prop({ required: true, min: 1, default: 60 })
  estimatedTimeMinutes: number;

  // --- Content Status Lifecycle & Soft Delete ---
  @Prop({
    type: String,
    enum: ModuleStatus,
    default: ModuleStatus.DRAFT,
  })
  status: ModuleStatus;

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

export const CourseModuleSchema = SchemaFactory.createForClass(CourseModule);

// --- Indexing Strategy ---
CourseModuleSchema.index({ courseId: 1, order: 1 }, { unique: true });
CourseModuleSchema.index({ courseId: 1, slug: 1 }, { unique: true });
