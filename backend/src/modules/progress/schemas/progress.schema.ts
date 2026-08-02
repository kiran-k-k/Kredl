import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export type ProgressDocument = Progress & Document;

@Schema({ timestamps: true })
export class Progress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CourseModule' })
  lastAccessedModuleId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson' })
  lastViewedLesson?: Types.ObjectId;

  @Prop({ type: Date })
  lastViewedAt?: Date;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Lesson' }],
    default: [],
    set: (v: Types.ObjectId[]) => {
      if (!v) return [];
      const seen = new Set();
      return v.filter((id) => {
        const str = id.toString();
        if (seen.has(str)) return false;
        seen.add(str);
        return true;
      });
    },
  })
  completedLessons: Types.ObjectId[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Project' }],
    default: [],
    set: (v: Types.ObjectId[]) => {
      if (!v) return [];
      const seen = new Set();
      return v.filter((id) => {
        const str = id.toString();
        if (seen.has(str)) return false;
        seen.add(str);
        return true;
      });
    },
  })
  completedProjects: Types.ObjectId[];

  @Prop({ required: true, min: 0, max: 100, default: 0 })
  percentage: number;

  @Prop({ type: Date, default: Date.now })
  lastAccessedAt: Date;

  // --- Aggregation Safety ---
  @Prop({ type: Date })
  lastCalculatedAt?: Date;

  @Prop({ type: Boolean, default: false })
  isDirty: boolean;

  @Prop({
    type: String,
    enum: ProgressStatus,
    default: ProgressStatus.NOT_STARTED,
  })
  status: ProgressStatus;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);

// --- Indexing Strategy ---
ProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
ProgressSchema.index({ status: 1 });
ProgressSchema.index({ userId: 1, lastAccessedAt: -1 });
