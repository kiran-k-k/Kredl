import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuizAttemptDocument = QuizAttempt & Document;

@Schema()
class AnswerRecord {
  @Prop({ type: Types.ObjectId, required: true })
  questionId: Types.ObjectId;

  @Prop({ required: true })
  selectedAnswer: string;

  @Prop({ required: true })
  isCorrect: boolean;
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } }) // Immutable by design
export class QuizAttempt {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quizId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CourseModule', required: true })
  moduleId: Types.ObjectId;

  @Prop({ type: [AnswerRecord], required: true })
  answers: AnswerRecord[];

  @Prop({ required: true, min: 0 })
  score: number;

  @Prop({ required: true, min: 0, max: 100 })
  percentage: number;

  @Prop({ required: true })
  passed: boolean;

  @Prop({ required: true, min: 1 })
  attemptNumber: number;

  // --- Analytics & Anti-Cheat Controls ---
  @Prop({ required: true })
  timeTakenSeconds: number;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  deviceInfo?: string;

  @Prop({ type: Date, required: true })
  startedAt: Date;

  @Prop({ type: Date, required: true })
  submittedAt: Date;
}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);

// --- Indexing Strategy ---
QuizAttemptSchema.index(
  { userId: 1, quizId: 1, attemptNumber: -1 },
  { unique: true },
);
QuizAttemptSchema.index({ moduleId: 1, passed: 1 });
QuizAttemptSchema.index({ userId: 1, moduleId: 1 });
