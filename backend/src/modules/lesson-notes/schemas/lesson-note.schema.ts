import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LessonNoteDocument = LessonNote & Document;

@Schema({ timestamps: true })
export class LessonNote {
  @Prop({
    type: Types.ObjectId,
    ref: 'Lesson',
    required: true,
    unique: true,
    index: true,
  })
  lessonId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  content: string;

  @Prop({ maxlength: 300, default: '' })
  summary: string;

  @Prop({ type: [String], default: [] })
  downloadableReferences: string[];

  // --- Soft Delete System ---
  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ required: true, default: 0 })
  order: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const LessonNoteSchema = SchemaFactory.createForClass(LessonNote);
