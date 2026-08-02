import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuizDocument = Quiz & Document;

@Schema()
export class Question {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  questionText: string;

  @Prop({
    type: [String],
    required: true,
    validate: {
      validator: (v: string[]) => v.length >= 2,
      message: 'A question must have at least 2 options.',
    },
  })
  options: string[];

  @Prop({ required: true, min: 0 })
  correctAnswerIndex: number;

  @Prop({ type: String, trim: true })
  explanation?: string;

  @Prop({ type: Number, required: true, default: 0 })
  order: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({ timestamps: true })
export class Quiz {
  @Prop({
    type: Types.ObjectId,
    ref: 'CourseModule',
    required: true,
    unique: true,
  })
  moduleId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: [QuestionSchema], required: true })
  questions: Question[];

  @Prop({ required: true, min: 1, default: 15 })
  timeLimitMinutes: number;

  @Prop({ required: true, min: 1, max: 100, default: 70 })
  passingScorePercentage: number;

  @Prop({ required: true, min: 1, default: 10 })
  totalMarks: number;

  @Prop({ type: String, enum: ['REGULAR', 'PRACTICE', 'MOCK_TEST'], default: 'REGULAR' })
  type: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Company' }], default: [] })
  targetCompanies: Types.ObjectId[];

  // --- Real-world LMS Features ---
  @Prop({ type: Boolean, default: true })
  shuffleOptions: boolean;

  @Prop({ type: Boolean, default: false })
  showCorrectAnswerAfterSubmit: boolean;

  @Prop({ type: Number, default: 3 })
  maxAttempts: number;

  @Prop({ type: Number, default: 1440 }) // Default 24 hour cooldown (1440 minutes)
  cooldownMinutes: number;

  @Prop({ type: Number, default: 1 })
  version: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: true })
  isPublished: boolean;

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

export const QuizSchema = SchemaFactory.createForClass(Quiz);

// --- Indexing Strategy ---
QuizSchema.index({ moduleId: 1 }, { unique: true });
QuizSchema.index({ isPublished: 1, isDeleted: 1 });
