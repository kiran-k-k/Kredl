import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ModuleStatus {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
  COMPLETED = 'completed',
}

export type ModuleCompletionDocument = ModuleCompletion & Document;

@Schema({ timestamps: true })
export class ModuleCompletion {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CourseModule', required: true })
  moduleId: Types.ObjectId;

  @Prop({ required: true })
  orderIndex: number;

  @Prop({
    type: String,
    enum: ModuleStatus,
    default: ModuleStatus.LOCKED,
  })
  status: ModuleStatus;

  @Prop({ min: 0, max: 100 })
  quizScore?: number;

  @Prop({ type: Date })
  unlockedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;
}

export const ModuleCompletionSchema =
  SchemaFactory.createForClass(ModuleCompletion);

// --- Indexing Strategy ---
ModuleCompletionSchema.index({ userId: 1, moduleId: 1 }, { unique: true });
ModuleCompletionSchema.index({ userId: 1, courseId: 1 });
ModuleCompletionSchema.index({ userId: 1, status: 1 });
