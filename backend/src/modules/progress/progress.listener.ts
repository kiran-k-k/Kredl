import { Injectable, Logger } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { ProgressService } from './progress.service';

export interface LessonCompletedEvent {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  moduleId: Types.ObjectId;
  lessonId: Types.ObjectId;
}

export interface ProgressRecalculateEvent {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
}

export interface QuizPassedEvent {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  moduleId: Types.ObjectId;
  quizId: Types.ObjectId;
  percentage: number;
}

@Injectable()
export class ProgressListener {
  constructor(
    private readonly progressService: ProgressService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('lesson.completed', { async: true })
  async handleLessonCompleted(payload: LessonCompletedEvent) {
    await this.progressService.markLessonComplete(
      payload.userId,
      payload.courseId,
      payload.lessonId,
    );
  }

  @OnEvent('quiz.passed', { async: true })
  async handleQuizPassed(payload: {
    userId: string;
    courseId: string;
    moduleId: string;
    quizId: string;
    percentage: number;
  }) {
    await this.progressService.saveQuizScore(
      new Types.ObjectId(payload.userId),
      new Types.ObjectId(payload.courseId),
      new Types.ObjectId(payload.moduleId),
      new Types.ObjectId(payload.quizId),
      payload.percentage,
      true // passed is true for QuizPassedEvent
    );
  }

  @OnEvent('progress.recalculate', { async: true })
  async handleProgressRecalculate(payload: ProgressRecalculateEvent) {
    // Left for explicit recalculation events if needed
  }
}
