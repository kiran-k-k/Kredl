import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, trim: true, maxlength: 100 })
  title: string;

  @Prop({ required: true, trim: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true, maxlength: 200 })
  shortDescription: string;

  @Prop({ required: true, maxlength: 5000 })
  description: string;

  @Prop({
    required: true,
    enum: [
      'Software Development',
      'Artificial Intelligence',
      'Embedded Systems',
      'Productivity',
      'Placement',
      'Placement Preparation',
      'Communication',
      'Competitive Exams',
      'DSA',
      'Java',
      'Web Dev',
      'System Design',
    ],
  })
  category: string;

  @Prop({ required: true, enum: ['Beginner', 'Intermediate', 'Advanced'] })
  difficulty: string;

  @Prop({ required: false, enum: ['Beginner', 'Intermediate', 'Advanced'] })
  difficultyLevel: string;

  @Prop({
    required: true,
    match: [
      /^(https?:\/\/res\.cloudinary\.com\/.+|https?:\/\/.+)/i,
      'Must be a valid URL',
    ],
  })
  thumbnail: string;

  @Prop({ required: false, default: '' })
  thumbnailAlt: string;

  @Prop({ required: true })
  estimatedDuration: string;

  @Prop({ type: Number, default: 0, min: 0 })
  moduleCount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  lessonCount: number;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Boolean, default: false })
  isPublished: boolean;

  @Prop({ type: String })
  seoTitle?: string;

  @Prop({ type: String })
  seoDescription?: string;

  @Prop({ type: [String], index: true })
  tags: string[];

  @Prop({ type: [String], default: [] })
  learningOutcomes: string[];

  @Prop({ type: [String], default: [] })
  prerequisites: string[];

  // --- Metrics ---
  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ type: Number, default: 0, min: 0 })
  enrollmentCount: number;

  // --- Content Status Lifecycle ---
  @Prop({
    type: String,
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  // --- Soft Delete System ---
  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy?: Types.ObjectId;

  // --- Content Versioning ---
  @Prop({ type: Number, default: 1 })
  version: number;

  // --- Content Ownership Control ---
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy?: Types.ObjectId;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// --- Indexing Strategy ---
CourseSchema.index({ category: 1, difficulty: 1 });
CourseSchema.index({
  title: 'text',
  shortDescription: 'text',
  description: 'text',
  tags: 'text',
});

// --- Recommendation Indexes ---
CourseSchema.index({ isPublished: 1, rating: -1, enrollmentCount: -1 }); // Top Courses
CourseSchema.index({ isPublished: 1, displayOrder: 1, createdAt: -1 }); // Default display order then newest
CourseSchema.index({ slug: 1 }, { unique: true });
