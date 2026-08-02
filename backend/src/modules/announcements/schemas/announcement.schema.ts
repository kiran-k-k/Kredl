import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum AudienceType {
  ALL = 'all',
  STUDENTS = 'students',
  TPO = 'tpo',
}

@Schema({ timestamps: true })
export class Announcement extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: String, enum: AudienceType, required: true })
  audience: AudienceType;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  targetBranches: string[];

  @Prop({ type: [Number], default: [] })
  targetYears: number[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }], default: [] })
  targetCourses: Types.ObjectId[];

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);

// --- Indexing Strategy ---
AnnouncementSchema.index({ audience: 1, isActive: 1, expiresAt: 1 });
