import re

with open('src/modules/progress/progress.listener.ts', 'r') as f:
    content = f.read()

new_listener = """import { Injectable } from '@nestjs/common';
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
  async handleQuizPassed(payload: QuizPassedEvent) {
    await this.progressService.saveQuizScore(
      payload.userId,
      payload.courseId,
      payload.moduleId,
      payload.quizId,
      payload.percentage,
      true // passed is true for QuizPassedEvent
    );
  }

  @OnEvent('progress.recalculate', { async: true })
  async handleProgressRecalculate(payload: ProgressRecalculateEvent) {
    // Left for explicit recalculation events if needed
  }
}
"""

with open('src/modules/progress/progress.listener.ts', 'w') as f:
    f.write(new_listener)
