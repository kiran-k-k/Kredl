import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Analytics extends Document {
  @Prop({ type: Date, required: true, unique: true })
  date: Date;

  @Prop({ default: 0 })
  activeUsers: number;

  @Prop({ default: 0 })
  newUsers: number;

  @Prop({ default: 0 })
  courseViews: number;

  @Prop({ default: 0 })
  lessonCompletions: number;

  @Prop({ default: 0 })
  quizCompletions: number;

  @Prop({
    type: [{ jobId: { type: Types.ObjectId, ref: 'Job' }, views: Number }],
    default: [],
  })
  popularJobs: Array<{ jobId: Types.ObjectId; views: number }>;

  @Prop({
    type: [
      { courseId: { type: Types.ObjectId, ref: 'Course' }, views: Number },
    ],
    default: [],
  })
  popularCourses: Array<{ courseId: Types.ObjectId; views: number }>;

  @Prop({ type: [String], default: [] })
  searchLogs: string[];

  @Prop({ default: 0 })
  avgSessionTime: number;

  @Prop({ default: 0 })
  placementApplicationsCount: number;
}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);

// --- Indexing Strategy ---
AnalyticsSchema.index({ date: -1 });
