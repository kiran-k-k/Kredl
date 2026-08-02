import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LessonStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export type LessonDocument = Lesson & Document;

@Schema({ timestamps: true })
export class Lesson {
  @Prop({
    type: Types.ObjectId,
    ref: 'CourseModule',
    required: true,
    index: true,
  })
  moduleId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 100 })
  title: string;

  @Prop({ required: true, trim: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop({
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{11}([&?#][^\s]*)?$/.test(v);
      },
      message: 'Must be a valid YouTube URL (watch, embed, or shorts)'
    }
  })
  youtubeUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'LessonNote' })
  notesId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  learningObjectives: string[];

  @Prop({ type: [String], default: [] })
  keyPoints: string[];

  @Prop({ type: String })
  githubUrl?: string;

  @Prop({ type: String })
  challengeDescription?: string;

  @Prop({ required: true, min: 1, default: 5 })
  durationMinutes: number;

  @Prop({ required: true })
  order: number;

  // --- Analytics Hook ---
  @Prop({ type: Number, default: 0 })
  viewCount: number;

  // --- Content Status Lifecycle & Soft Delete ---
  @Prop({
    type: String,
    enum: LessonStatus,
    default: LessonStatus.DRAFT,
  })
  status: LessonStatus;

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

export const LessonSchema = SchemaFactory.createForClass(Lesson);

// --- Indexing Strategy ---
LessonSchema.index({ moduleId: 1, order: 1 }, { unique: true });
LessonSchema.index({ moduleId: 1, slug: 1 }, { unique: true });
