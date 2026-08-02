import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  WELCOME = 'WELCOME',
  COURSE_COMPLETED = 'COURSE_COMPLETED',
  NEW_MODULE = 'NEW_MODULE',
  NEW_COMPANY = 'NEW_COMPANY',
  PLACEMENT_DRIVE = 'PLACEMENT_DRIVE',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  GENERAL = 'GENERAL',
  NEW_JOB = 'NEW_JOB',
}

export enum NotificationCategory {
  LEARNING = 'Learning',
  PLACEMENT = 'Placement',
  COMPANY = 'Company',
  SYSTEM = 'System',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isGlobal: boolean;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ type: String, enum: NotificationCategory, required: true })
  category: NotificationCategory;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: String })
  actionUrl?: string;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Date })
  readAt?: Date;

  @Prop({
    type: String,
    enum: NotificationPriority,
    default: NotificationPriority.LOW,
  })
  priority: NotificationPriority;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// --- Indexing Strategy ---
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ isGlobal: 1, createdAt: -1 });
