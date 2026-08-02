import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuizDocument = Quiz & Document;

@Schema()
class Question {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  questionText: string;

  @Prop({
    type: [String],
    required: true,
    validate: (v: string[]) => v.length >= 2,
  })
  options: string[];

  @Prop({ required: true, min: 0 })
  correctAnswerIndex: number;
}

@Schema({ timestamps: true })
export class Quiz {
  @Prop({
    type: Types.ObjectId,
    ref: 'CourseModule',
    required: true,
    unique: true,
  })
  moduleId: Types.ObjectId;

  @Prop({ type: [Question], required: true })
  questions: Question[];

  @Prop({ required: true, min: 1 })
  timeLimitMinutes: number;

  @Prop({ required: true, min: 1, max: 100 })
  passingScorePercentage: number;

  @Prop({ required: true, min: 1 })
  totalMarks: number;

  // --- Real-world LMS Features ---
  @Prop({ type: Boolean, default: true })
  shuffleOptions: boolean;

  @Prop({ type: Boolean, default: false })
  showCorrectAnswerAfterSubmit: boolean;

  @Prop({ type: Number, default: 3 })
  maxAttempts: number;

  @Prop({ type: Number, default: 1440 }) // Default 24 hour cooldown
  cooldownMinutes: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

// --- Indexing Strategy ---
QuizSchema.index({ moduleId: 1 }, { unique: true });
