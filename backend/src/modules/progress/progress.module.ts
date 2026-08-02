import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Progress, ProgressSchema } from './schemas/progress.schema';
import {
  ModuleCompletion,
  ModuleCompletionSchema,
} from './schemas/module-completion.schema';
import { Quiz, QuizSchema } from '../quiz/schemas/quiz.schema';
import {
  QuizAttempt,
  QuizAttemptSchema,
} from '../quiz/schemas/quiz-attempt.schema';
import { ProgressService } from './progress.service';
import { ProgressListener } from './progress.listener';
import { ProgressController } from './progress.controller';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import {
  CourseModule,
  CourseModuleSchema,
} from '../modules/schemas/module.schema';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';
import { QuizModule } from '../quiz/quiz.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { UsersModule } from '../users/users.module';

import { ProgressCalculationService } from './progress-calculation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Progress.name, schema: ProgressSchema },
      { name: ModuleCompletion.name, schema: ModuleCompletionSchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: Course.name, schema: CourseSchema },
      { name: CourseModule.name, schema: CourseModuleSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
    forwardRef(() => QuizModule),
    forwardRef(() => DashboardModule),
    UsersModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService, ProgressCalculationService, ProgressListener],
  exports: [ProgressService, ProgressCalculationService, MongooseModule],
})
export class ProgressModule {}
