import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuizAttemptDocument = QuizAttempt & Document;

@Schema({ _id: false })
export class AnswerRecord {
  @Prop({ type: Types.ObjectId, required: true })
  questionId: Types.ObjectId;

  @Prop({ required: true })
  selectedAnswerIndex: number;

  @Prop({ required: true })
  isCorrect: boolean;
}

export const AnswerRecordSchema = SchemaFactory.createForClass(AnswerRecord);

export enum QuizAttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } }) // Immutable by design
export class QuizAttempt {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true, index: true })
  quizId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'CourseModule',
    required: true,
    index: true,
  })
  moduleId: Types.ObjectId;

  @Prop({
    type: String,
    enum: QuizAttemptStatus,
    default: QuizAttemptStatus.IN_PROGRESS,
    required: true,
    index: true,
  })
  status: QuizAttemptStatus;

  @Prop({ type: [AnswerRecordSchema], required: false, default: [] })
  answers: AnswerRecord[];

  @Prop({ required: false, min: 0 })
  score?: number;

  @Prop({ required: false, min: 0 })
  correctAnswers?: number;

  @Prop({ required: false, min: 0 })
  wrongAnswers?: number;

  @Prop({ required: false, min: 0 })
  totalQuestions?: number;

  @Prop({ required: false, min: 0, max: 100 })
  percentage?: number;

  @Prop({ required: false, index: true })
  passed?: boolean;

  @Prop({ required: true, min: 1 })
  attemptNumber: number;

  @Prop({ required: true, min: 1, default: 1 })
  quizVersion: number;

  // --- Analytics & Anti-Cheat Controls ---
  @Prop({ required: false, min: 0 })
  timeTakenSeconds?: number;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  deviceInfo?: string;

  @Prop({ type: Date, required: true })
  startedAt: Date;

  @Prop({ type: Date, required: false })
  submittedAt?: Date;

  @Prop({ type: Date, required: false })
  completedAt?: Date;
}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);

// --- Indexing Strategy ---
QuizAttemptSchema.index(
  { userId: 1, quizId: 1, attemptNumber: -1 },
  { unique: true },
);
QuizAttemptSchema.index({ moduleId: 1, passed: 1 });
QuizAttemptSchema.index({ userId: 1, moduleId: 1 });
QuizAttemptSchema.index({ userId: 1, passed: 1 });
