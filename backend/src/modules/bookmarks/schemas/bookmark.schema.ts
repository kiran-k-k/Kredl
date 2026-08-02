import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum BookmarkType {
  COURSE = 'course',
  JOB = 'job',
  COMPANY = 'company',
  ROLE = 'role',
}

@Schema({ timestamps: true })
export class Bookmark extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: BookmarkType, required: true })
  entityType: BookmarkType;

  // Polymorphic reference depending on entityType
  @Prop({ type: Types.ObjectId, required: true })
  entityId: Types.ObjectId;
}

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);

// --- Indexing Strategy ---
BookmarkSchema.index({ userId: 1, entityId: 1 }, { unique: true });
BookmarkSchema.index({ userId: 1, entityType: 1 });
